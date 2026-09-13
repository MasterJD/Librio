import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AgentDiscoveryService } from '../discovery/agent-discovery.service';
import { A2AClientService } from '../a2a/a2a-client.service';
import { StructuredLogger } from '../logger/logger.service';

const USERS_SVC_URL = process.env.USERS_SVC_URL || 'http://localhost:8002';

export interface OrchestrateRequest {
  instruction: string;
  authToken?: string;
}

type Intent = 'SEARCH' | 'RENT' | 'PURCHASE' | 'RETURN' | 'NOTIFY';

const INTENT_KEYWORDS: Record<Intent, RegExp> = {
  SEARCH: /buscar|busqueda|search|find|listar|list/,
  RENT: /rentar|renta|alquilar|alquila|rent/,
  PURCHASE: /comprar|compra|buy|adquirir|buy_book/,
  RETURN: /devolver|devuelve|return/,
  NOTIFY: /notificar|notifica|avisa|envia.*correo|notify|email/,
};

const STOP_WORDS =
  /\b(de|del|el|la|los|las|un|una|unos|unas|me|te|le|y|e|o|u|por|favor|libro|libros|mi|para|quiero|necesito|porfavor|the|a|an|and|of|for|to|my|please|book|books|i|want|need)\b/gi;

const GENRE_KEYWORDS: Record<string, string> = {
  'fantasia': 'fantasy',
  'fantasy': 'fantasy',
  'ciencia ficcion': 'science-fiction',
  'cienciaficcion': 'science-fiction',
  'science fiction': 'science-fiction',
  'sci-fi': 'science-fiction',
  'programacion': 'programming',
  'programming': 'programming',
  'misterio': 'mystery',
  'mystery': 'mystery',
  'distopia': 'dystopian',
  'dystopian': 'dystopian',
  'dystopia': 'dystopian',
  'no ficcion': 'non-fiction',
  'no ficción': 'non-fiction',
  'non fiction': 'non-fiction',
};

@Injectable()
export class OrchestrateService {
  private readonly logger = new StructuredLogger('orchestrator-agent');

  constructor(
    private readonly discovery: AgentDiscoveryService,
    private readonly a2aClient: A2AClientService,
  ) {}

  async orchestrate(request: OrchestrateRequest, correlationId?: string): Promise<any> {
    const { instruction, authToken } = request;
    const text = (instruction || '').trim();
    if (!text) throw new Error('Instruction is required');

    const intents = this.detectIntents(text);
    this.logger.log('Instruction received', correlationId, {
      payload: { instruction: text, intents, authToken: !!authToken },
    });

    if (intents.length === 0) {
      return {
        error: `No intent recognized. Try: "compra Dune", "renta Dune", "buscar libros de fantasía", "devolver renta de Dune", "notifícame"`,
      };
    }

    const bookTitle = this.extractTitle(text);

    // Resolve the authenticated user (needed for notifications / transactions)
    let userId: number | undefined;
    if (authToken) {
      try {
        const profile = await axios.get(`${USERS_SVC_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 5000,
        });
        userId = profile.data?.id;
      } catch (error: any) {
        this.logger.warn('Could not resolve user from token', correlationId, {
          payload: { error: error.message },
        });
      }
    }

    const results: Record<string, any> = {};
    const catalogUrl = process.env.CATALOG_AGENT_URL || 'http://localhost:9001';
    const transactionUrl = process.env.TRANSACTION_AGENT_URL || 'http://localhost:9002';
    const notificationUrl = process.env.NOTIFICATION_AGENT_URL || 'http://localhost:9003';

    // 1) Book lookup (when a title was mentioned)
    let bookId: number | undefined;
    const genre = this.detectGenre(text);
    if (bookTitle && !genre) {
      const search = await this.a2aClient.sendTask(
        catalogUrl,
        'search_books',
        { query: bookTitle },
        correlationId,
      );
      const payload = this.a2aClient.extractText(search);
      const books = payload?.books || [];
      const match =
        books.find((b: any) => b.title?.toLowerCase() === bookTitle.toLowerCase()) ||
        books[0];
      if (match) {
        bookId = match.id;
        results.book = match;
      } else {
        results.book = { error: `No book found for "${bookTitle}"` };
      }
    }

    // 2) Execute intents in order
    for (const intent of intents) {
      switch (intent) {
        case 'SEARCH': {
          const result = await this.a2aClient.sendTask(
            catalogUrl,
            'search_books',
            genre ? { genre } : bookTitle ? { query: bookTitle } : {},
            correlationId,
          );
          results.search = this.a2aClient.extractText(result);
          break;
        }
        case 'RENT': {
          if (!bookId) break;
          if (!authToken) {
            results.rent = { error: 'authToken is required to rent a book' };
            break;
          }
          const result = await this.a2aClient.sendTask(
            transactionUrl,
            'create_rental',
            { bookId, durationDays: 14, authToken },
            correlationId,
          );
          results.rent = this.a2aClient.extractText(result);
          break;
        }
        case 'PURCHASE': {
          if (!bookId) break;
          if (!authToken) {
            results.purchase = { error: 'authToken is required to purchase a book' };
            break;
          }
          const result = await this.a2aClient.sendTask(
            transactionUrl,
            'purchase_book',
            { bookId, authToken },
            correlationId,
          );
          results.purchase = this.a2aClient.extractText(result);
          break;
        }
        case 'RETURN': {
          if (!authToken) {
            results.return_ = { error: 'authToken is required to return a book' };
            break;
          }
          const library = await this.a2aClient.sendTask(
            transactionUrl,
            'get_my_library',
            { authToken },
            correlationId,
          );
          const libPayload = this.a2aClient.extractText(library);
          const items = libPayload?.library || libPayload || [];
          const matches = (i: any) =>
            bookTitle
              ? i.title?.toLowerCase().includes(bookTitle.toLowerCase())
              : true;
          const rental = bookTitle
            ? items.find((i: any) => matches(i) && i.type === 'RENTED')
            : items.find((i: any) => i.type === 'RENTED' && i.status === 'ACTIVE');
          if (!rental?.rentalId) {
            results.return_ = {
              error: `No active rental found${bookTitle ? ` for "${bookTitle}"` : ''}. Items: ${
                Array.isArray(items) ? items.length : 0
              }`,
            };
            break;
          }
          const result = await this.a2aClient.sendTask(
            transactionUrl,
            'return_book',
            { rentalId: rental.rentalId, authToken },
            correlationId,
          );
          results.return_ = this.a2aClient.extractText(result);
          break;
        }
        case 'NOTIFY': {
          if (!userId) {
            results.notify = { error: 'authToken is required to send notifications' };
            break;
          }
          const result = await this.a2aClient.sendTask(
            notificationUrl,
            'send_notification',
            {
              userId,
              type: bookId ? 'PURCHASE_CONFIRMATION' : 'WELCOME',
              subject: bookId
                ? `Bookly: ${results.book?.title || 'your book'} confirmed`
                : 'Bookly: welcome',
              message: bookId
                ? `Your transaction for "${results.book?.title || 'your book'}" is confirmed. Thank you for using Bookly!`
                : 'Welcome to Bookly! Your registration was successful.',
            },
            correlationId,
          );
          results.notify = this.a2aClient.extractText(result);
          break;
        }
      }
    }

    this.logger.log('Orchestration completed', correlationId, {
      payload: { instruction: text, intents, results },
    });
    return {
      instruction: text,
      intents,
      delegatedTo: {
        catalog: catalogUrl,
        transaction: transactionUrl,
        notification: notificationUrl,
      },
      results,
    };
  }

  private detectIntents(text: string): Intent[] {
    const found: Intent[] = [];
    const lower = text.toLowerCase();
    for (const [intent, regex] of Object.entries(INTENT_KEYWORDS)) {
      if (regex.test(lower)) found.push(intent as Intent);
    }
    return found;
  }

  private extractTitle(text: string): string | undefined {
    const lower = text
      .toLowerCase()
      .replace(INTENT_KEYWORDS.SEARCH, ' ')
      .replace(INTENT_KEYWORDS.RENT, ' ')
      .replace(INTENT_KEYWORDS.PURCHASE, ' ')
      .replace(INTENT_KEYWORDS.RETURN, ' ')
      .replace(INTENT_KEYWORDS.NOTIFY, ' ')
      .replace(STOP_WORDS, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return lower.length >= 2 ? lower : undefined;
  }

  private detectGenre(text: string): string | undefined {
    const lower = text.toLowerCase().replace(/\s+/g, ' ');
    for (const [keyword, genre] of Object.entries(GENRE_KEYWORDS)) {
      if (lower.includes(keyword)) return genre;
    }
    return undefined;
  }
}