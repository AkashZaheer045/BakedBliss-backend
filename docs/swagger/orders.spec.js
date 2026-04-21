/**
 * Orders Module Swagger Specifications
 */

const ordersSpec = {
    paths: {
        '/order/create': {
            post: {
                tags: ['Orders'],
                summary: 'Create a new order',
                description: 'Convert cart to order and place order',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    address_id: { type: 'string' },
                                    payment_method: { type: 'string' }
                                },
                                required: ['address_id']
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Order created successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/order/history': {
            get: {
                tags: ['Orders'],
                summary: 'Get order history',
                description: 'Get all orders for authenticated user with pagination',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'query',
                        name: 'page',
                        schema: { type: 'integer', default: 1 }
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: { type: 'integer', default: 10 }
                    }
                ],
                responses: {
                    200: {
                        description: 'Order history',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Order' }
                                        },
                                        pagination: { $ref: '#/components/schemas/Pagination' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/order/status/{orderId}': {
            get: {
                tags: ['Orders'],
                summary: 'Get order status',
                description: 'Get details and status of a specific order',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'orderId',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Order details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' }
                            }
                        }
                    },
                    404: { $ref: '#/components/responses/NotFound' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/order/details/{orderId}': {
            get: {
                tags: ['Orders'],
                summary: 'Get order details',
                description: 'Get complete details of a specific order',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'orderId',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Order details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' }
                            }
                        }
                    },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },

        '/order/cancel/{orderId}': {
            put: {
                tags: ['Orders'],
                summary: 'Cancel order',
                description: 'Cancel an existing order',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'orderId',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Order cancelled successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SuccessResponse' }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        }
    }
};

module.exports = ordersSpec;
