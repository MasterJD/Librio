import axios from 'axios';

const CATALOG_SVC_URL = process.env.CATALOG_SVC_URL || 'http://localhost:8001';
const TRANSACTION_SVC_URL = process.env.TRANSACTION_SVC_URL || 'http://localhost:8003';

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: any) => Promise<any>;
}

export const searchBooksTool: Tool = {
  name: 'search_books',
  description: 'Search for books in the catalog by title, author, or genre',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query for title or author' },
      genre: { type: 'string', description: 'Filter by genre (e.g., science-fiction, technology)' },
    },
  },
  handler: async (params: { query?: string; genre?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('title', params.query);
    if (params.genre) queryParams.append('genre', params.genre);
    
    const response = await axios.get(`${CATALOG_SVC_URL}/books?${queryParams.toString()}`);
    return {
      books: response.data,
      count: response.data.length,
    };
  },
};

export const getBookTool: Tool = {
  name: 'get_book',
  description: 'Get detailed information about a specific book',
  inputSchema: {
    type: 'object',
    properties: {
      bookId: { type: 'number', description: 'The ID of the book' },
    },
    required: ['bookId'],
  },
  handler: async (params: { bookId: number }) => {
    const response = await axios.get(`${CATALOG_SVC_URL}/books/${params.bookId}`);
    return response.data;
  },
};

export const createRentalTool: Tool = {
  name: 'create_rental',
  description: 'Create a rental for a book. Requires authentication.',
  inputSchema: {
    type: 'object',
    properties: {
      bookId: { type: 'number', description: 'The ID of the book to rent' },
      durationDays: { type: 'number', description: 'Rental duration in days (1-30)', default: 14 },
      authToken: { type: 'string', description: 'JWT authentication token' },
    },
    required: ['bookId', 'authToken'],
  },
  handler: async (params: { bookId: number; durationDays?: number; authToken: string }) => {
    const response = await axios.post(
      `${TRANSACTION_SVC_URL}/rentals`,
      { bookId: params.bookId, durationDays: params.durationDays || 14 },
      { headers: { Authorization: `Bearer ${params.authToken}` } },
    );
    return response.data;
  },
};

export const purchaseBookTool: Tool = {
  name: 'purchase_book',
  description: 'Purchase a book. Requires authentication.',
  inputSchema: {
    type: 'object',
    properties: {
      bookId: { type: 'number', description: 'The ID of the book to purchase' },
      authToken: { type: 'string', description: 'JWT authentication token' },
    },
    required: ['bookId', 'authToken'],
  },
  handler: async (params: { bookId: number; authToken: string }) => {
    const response = await axios.post(
      `${TRANSACTION_SVC_URL}/purchases`,
      { bookId: params.bookId },
      { headers: { Authorization: `Bearer ${params.authToken}` } },
    );
    return response.data;
  },
};

export const returnBookTool: Tool = {
  name: 'return_book',
  description: 'Return a rented book. Requires authentication.',
  inputSchema: {
    type: 'object',
    properties: {
      rentalId: { type: 'number', description: 'The ID of the rental to return' },
      authToken: { type: 'string', description: 'JWT authentication token' },
    },
    required: ['rentalId', 'authToken'],
  },
  handler: async (params: { rentalId: number; authToken: string }) => {
    const response = await axios.post(
      `${TRANSACTION_SVC_URL}/rentals/${params.rentalId}/return`,
      {},
      { headers: { Authorization: `Bearer ${params.authToken}` } },
    );
    return response.data;
  },
};

export const getMyLibraryTool: Tool = {
  name: 'get_my_library',
  description: 'Get the authenticated user\'s library (rentals and purchases). Requires authentication.',
  inputSchema: {
    type: 'object',
    properties: {
      authToken: { type: 'string', description: 'JWT authentication token' },
    },
    required: ['authToken'],
  },
  handler: async (params: { authToken: string }) => {
    const response = await axios.get(`${TRANSACTION_SVC_URL}/library`, {
      headers: { Authorization: `Bearer ${params.authToken}` },
    });
    return {
      library: response.data,
      count: response.data.length,
    };
  },
};

export const allTools: Tool[] = [
  searchBooksTool,
  getBookTool,
  createRentalTool,
  purchaseBookTool,
  returnBookTool,
  getMyLibraryTool,
];
