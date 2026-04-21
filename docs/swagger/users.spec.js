/**
 * User Management Module Swagger Specifications
 */

const usersSpec = {
    paths: {
        '/users/profile': {
            get: {
                tags: ['User Profile'],
                summary: 'Get user profile',
                description: 'Get authenticated user profile information',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'User profile',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            put: {
                tags: ['User Profile'],
                summary: 'Update user profile',
                description: 'Update authenticated user profile information',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateProfileRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Profile updated successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/users/favorites': {
            get: {
                tags: ['User Favorites'],
                summary: 'Get user favorites',
                description: 'Get all favorite products for authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'List of favorite products',
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
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            post: {
                tags: ['User Favorites'],
                summary: 'Add to favorites',
                description: 'Add a product to user favorites list',
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
                    201: { $ref: '#/components/responses/Created' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/users/favorites/{product_id}': {
            delete: {
                tags: ['User Favorites'],
                summary: 'Remove from favorites',
                description: 'Remove a product from user favorites list',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: 'path',
                        name: 'product_id',
                        required: true,
                        schema: { type: 'integer' }
                    }
                ],
                responses: {
                    200: { $ref: '#/components/responses/Success' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        }
    }
};

module.exports = usersSpec;
