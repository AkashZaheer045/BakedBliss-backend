/**
 * Address Management Module Swagger Specifications
 */

const addressSpec = {
    paths: {
        '/address/add': {
            post: {
                tags: ['Address Management'],
                summary: 'Add a new address',
                description: 'Add new delivery address for user',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateAddressRequest' }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Address added successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Address' }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/address/update': {
            put: {
                tags: ['Address Management'],
                summary: 'Update address',
                description: 'Update an existing delivery address',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateAddressRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Address updated successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Address' }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },

        '/address/delete': {
            delete: {
                tags: ['Address Management'],
                summary: 'Delete address',
                description: 'Delete a delivery address',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    address_id: { type: 'string' }
                                },
                                required: ['address_id']
                            }
                        }
                    }
                },
                responses: {
                    200: { $ref: '#/components/responses/Success' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },

        '/address/list': {
            get: {
                tags: ['Address Management'],
                summary: 'Get all addresses',
                description: 'Retrieve all delivery addresses for user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'List of addresses',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Address' }
                                        }
                                    }
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

module.exports = addressSpec;
