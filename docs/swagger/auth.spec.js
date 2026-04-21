/**
 * Auth Module Swagger Specifications
 */

const authSpec = {
    paths: {
        '/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a new user',
                description: 'Create a new user account with email and password',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/RegisterRequest'
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/AuthResponse'
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },

        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'User login',
                description: 'Authenticate user with email and password',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/LoginRequest'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/AuthResponse'
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },

        '/auth/verify-otp': {
            post: {
                tags: ['Authentication'],
                summary: 'Verify OTP',
                description: 'Verify OTP sent to user email for 2FA',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/VerifyOtpRequest'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'OTP verified successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/SuccessResponse'
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/auth/resend-otp': {
            post: {
                tags: ['Authentication'],
                summary: 'Resend OTP',
                description: 'Request a new OTP to be sent to user email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' }
                                },
                                required: ['email']
                            }
                        }
                    }
                },
                responses: {
                    200: { $ref: '#/components/responses/Success' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },

        '/auth/forgot-password': {
            post: {
                tags: ['Authentication'],
                summary: 'Request password reset',
                description: 'Send password reset link to user email',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', format: 'email' }
                                },
                                required: ['email']
                            }
                        }
                    }
                },
                responses: {
                    200: { $ref: '#/components/responses/Success' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },

        '/auth/reset-password': {
            post: {
                tags: ['Authentication'],
                summary: 'Reset password',
                description: 'Reset user password with token and new password',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    token: { type: 'string' },
                                    new_password: { type: 'string', format: 'password' }
                                },
                                required: ['token', 'new_password']
                            }
                        }
                    }
                },
                responses: {
                    200: { $ref: '#/components/responses/Success' },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/auth/change-password': {
            post: {
                tags: ['Authentication'],
                summary: 'Change password',
                description: 'Change user password (authenticated user only)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    old_password: { type: 'string', format: 'password' },
                                    new_password: { type: 'string', format: 'password' }
                                },
                                required: ['old_password', 'new_password']
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

        '/auth/refresh-token': {
            post: {
                tags: ['Authentication'],
                summary: 'Refresh JWT token',
                description: 'Get a new JWT token using refresh token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    refresh_token: { type: 'string' }
                                },
                                required: ['refresh_token']
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'New token generated',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/AuthResponse'
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/auth/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'Logout user',
                description: 'Logout and invalidate current session',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { $ref: '#/components/responses/Success' }
                }
            }
        }
    }
};

module.exports = authSpec;
