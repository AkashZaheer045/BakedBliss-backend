/**
 * Common Swagger Components - Shared Schemas and Responses
 */

const commonComponents = {
    schemas: {
        User: {
            type: 'object',
            properties: {
                id: { type: 'integer', description: 'User ID' },
                full_name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone_number: { type: 'string' },
                profile_picture: { type: 'string' },
                role: { type: 'string', enum: ['user', 'admin'] },
                is_active: { type: 'boolean' },
                created_at: { type: 'string', format: 'date-time' }
            }
        },

        Product: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                title: { type: 'string' },
                price: { type: 'number', format: 'float' },
                sale_price: { type: 'number', format: 'float' },
                thumbnail: { type: 'string', format: 'uri' },
                category: { type: 'string' },
                rating: { type: 'number', format: 'float' },
                rating_count: { type: 'integer' },
                stock: { type: 'integer' },
                description: { type: 'string' },
                ingredients: { type: 'array', items: { type: 'string' } },
                images: { type: 'array', items: { type: 'string' } }
            }
        },

        Order: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
                order_id: { type: 'string' },
                user_id: { type: 'integer' },
                status: {
                    type: 'string',
                    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
                },
                total_amount: { type: 'number', format: 'float' },
                cart_items: { type: 'array' },
                delivery_address: { type: 'object' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        },

        Address: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postal_code: { type: 'string' },
                country: { type: 'string' },
                phone: { type: 'string' },
                is_default: { type: 'boolean' }
            }
        },

        CreateAddressRequest: {
            type: 'object',
            properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postal_code: { type: 'string' },
                country: { type: 'string' },
                phone: { type: 'string' }
            },
            required: ['street', 'city', 'state', 'postal_code', 'country']
        },

        UpdateAddressRequest: {
            type: 'object',
            properties: {
                address_id: { type: 'string' },
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postal_code: { type: 'string' },
                country: { type: 'string' },
                phone: { type: 'string' }
            },
            required: ['address_id']
        },

        CreateProductRequest: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                price: { type: 'number', format: 'float' },
                sale_price: { type: 'number', format: 'float' },
                category: { type: 'string' },
                description: { type: 'string' },
                ingredients: { type: 'array', items: { type: 'string' } },
                stock: { type: 'integer', default: 0 }
            },
            required: ['title', 'price', 'category']
        },

        RegisterRequest: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email' },
                full_name: { type: 'string' },
                password: { type: 'string', format: 'password', minLength: 6 }
            },
            required: ['email', 'full_name', 'password']
        },

        LoginRequest: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' }
            },
            required: ['email', 'password']
        },

        VerifyOtpRequest: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email' },
                otp: { type: 'string', minLength: 4, maxLength: 6 }
            },
            required: ['email', 'otp']
        },

        UpdateProfileRequest: {
            type: 'object',
            properties: {
                full_name: { type: 'string' },
                phone_number: { type: 'string' },
                profile_picture: { type: 'string', format: 'uri' }
            }
        },

        AuthResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string' },
                        refresh_token: { type: 'string' }
                    }
                }
            }
        },

        SuccessResponse: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                statusCode: { type: 'integer' },
                message: { type: 'string' },
                data: { type: 'object' }
            }
        },

        ErrorResponse: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'error' },
                statusCode: { type: 'integer' },
                message: { type: 'string' },
                data: { type: 'object' }
            }
        },

        Pagination: {
            type: 'object',
            properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                pages: { type: 'integer' }
            }
        }
    },

    responses: {
        Success: {
            description: 'Operation successful',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/SuccessResponse' }
                }
            }
        },

        Created: {
            description: 'Resource created successfully',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/SuccessResponse' }
                }
            }
        },

        BadRequest: {
            description: 'Bad request - validation error',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
            }
        },

        Unauthorized: {
            description: 'Unauthorized - authentication required',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: 'error' },
                            statusCode: { type: 'integer', example: 401 },
                            message: { type: 'string', example: 'Unauthorized' }
                        }
                    }
                }
            }
        },

        Forbidden: {
            description: 'Forbidden - insufficient permissions',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
            }
        },

        NotFound: {
            description: 'Not found',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
            }
        },

        TooManyRequests: {
            description: 'Too many requests - rate limit exceeded',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: 'error' },
                            statusCode: { type: 'integer', example: 429 },
                            message: { type: 'string', example: 'Too many requests' }
                        }
                    }
                }
            }
        }
    }
};

module.exports = commonComponents;
