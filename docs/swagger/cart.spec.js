/**
 * Shopping Cart Module Swagger Specifications
 */

const cartSpec = {
    paths: {
        '/cart/add': {
            post: {
                tags: ['Shopping Cart'],
                summary: 'Add item to cart',
                description: 'Add a product to user shopping cart',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    product_id: { type: 'integer' },
                                    quantity: { type: 'integer', minimum: 1 }
                                },
                                required: ['product_id', 'quantity']
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Item added to cart',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SuccessResponse' }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/cart/items': {
            get: {
                tags: ['Shopping Cart'],
                summary: 'View cart',
                description: 'Get all items in user shopping cart',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Cart items',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        items: { type: 'array' },
                                        total: { type: 'number' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/cart/update': {
            put: {
                tags: ['Shopping Cart'],
                summary: 'Update cart item',
                description: 'Update quantity of item in cart',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    product_id: { type: 'integer' },
                                    quantity: { type: 'integer', minimum: 1 }
                                },
                                required: ['product_id', 'quantity']
                            }
                        }
                    }
                },
                responses: {
                    200: { $ref: '#/components/responses/Success' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/cart/remove': {
            delete: {
                tags: ['Shopping Cart'],
                summary: 'Remove item from cart',
                description: 'Remove a product from user shopping cart',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    product_id: { type: 'integer' }
                                },
                                required: ['product_id']
                            }
                        }
                    }
                },
                responses: {
                    200: { $ref: '#/components/responses/Success' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/cart/clear': {
            delete: {
                tags: ['Shopping Cart'],
                summary: 'Clear cart',
                description: 'Remove all items from user shopping cart',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { $ref: '#/components/responses/Success' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        }
    }
};

module.exports = cartSpec;
