/**
 * Products Module Swagger Specifications
 */

const productsSpec = {
    paths: {
        '/products': {
            get: {
                tags: ['Products'],
                summary: 'List all products',
                description: 'Get paginated list of all products with optional filtering and sorting',
                parameters: [
                    {
                        in: 'query',
                        name: 'page',
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number'
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', default: 10 },
                        description: 'Items per page'
                    },
                    {
                        in: 'query',
                        name: 'category',
                        schema: { type: 'string' },
                        description: 'Filter by category'
                    },
                    {
                        in: 'query',
                        name: 'sort_by',
                        schema: { type: 'string', enum: ['price_asc', 'price_desc', 'rating', 'newest'] },
                        description: 'Sort order'
                    }
                ],
                responses: {
                    200: {
                        description: 'Products list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Product' }
                                        },
                                        pagination: {
                                            type: 'object',
                                            properties: {
                                                page: { type: 'integer' },
                                                limit: { type: 'integer' },
                                                total: { type: 'integer' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        '/products/search': {
            get: {
                tags: ['Products'],
                summary: 'Search products',
                description: 'Search products by title or category',
                parameters: [
                    {
                        in: 'query',
                        name: 'q',
                        required: true,
                        schema: { type: 'string', minLength: 1, maxLength: 100 },
                        description: 'Search query'
                    },
                    {
                        in: 'query',
                        name: 'page',
                        schema: { type: 'integer', default: 1 }
                    }
                ],
                responses: {
                    200: {
                        description: 'Search results',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Product' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/products/categories': {
            get: {
                tags: ['Products'],
                summary: 'Get all categories',
                description: 'Retrieve list of all available product categories',
                responses: {
                    200: {
                        description: 'Categories list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        '/products/trending': {
            get: {
                tags: ['Products'],
                summary: 'Get trending products',
                description: 'Retrieve best-selling and popular products',
                parameters: [
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', default: 5 }
                    }
                ],
                responses: {
                    200: {
                        description: 'Trending products',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Product' }
                                }
                            }
                        }
                    }
                }
            }
        },

        '/products/category/{category_name}': {
            get: {
                tags: ['Products'],
                summary: 'Get products by category',
                description: 'Get all products in a specific category',
                parameters: [
                    {
                        in: 'path',
                        name: 'category_name',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'page',
                        schema: { type: 'integer', default: 1 }
                    }
                ],
                responses: {
                    200: {
                        description: 'Products in category',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Product' }
                                }
                            }
                        }
                    }
                }
            }
        },

        '/products/upload': {
            post: {
                tags: ['Products'],
                summary: 'Create new product',
                description: 'Add a new product to catalog (admin only)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateProductRequest' }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Product created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Product' }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/products/recommendations': {
            get: {
                tags: ['Products'],
                summary: 'Get product recommendations',
                description: 'Get personalized product recommendations for user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Recommended products',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Product' }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        }
    }
};

module.exports = productsSpec;
