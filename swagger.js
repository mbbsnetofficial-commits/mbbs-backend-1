const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'MBBS NEET API',
            version: '1.0.0',
            description: 'API documentation for authentication, Question of the Day, and quick-test features.'
        },
        servers: [
            {
                url: process.env.PUBLIC_API_URL || 'https://api.mbbs.net',
                description: 'Production API server'
            },
            {
                url: 'http://localhost:3000',
                description: 'Local development server'
            }
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User registration and login endpoints'
            },
            {
                name: 'Question of the Day',
                description: 'Fetch the daily question and submit one answer per student'
            },
            {
                name: 'Quick Test',
                description: 'Select subjects and chapters, start a test, and submit answers'
            },
            {
                name: 'Test Leaderboard',
                description: 'Rank active students by their best completed test performance'
            },
            {
                name: 'Test Review Chatbot',
                description: 'Gemini-powered review chat grounded in a student\'s wrong test answers'
            },
            {
                name: 'User Activity',
                description: 'Record and retrieve application activity by numeric user ID'
            },
            {
                name: 'Question Feedback',
                description: 'Submit and retrieve student feedback for questions in their tests'
            },
            {
                name: 'Review Comments',
                description: 'Submit and retrieve authenticated student review comments'
            },
            {
                name: 'Notifications',
                description: 'Create, list, read, count, and dismiss authenticated student notifications'
            },
            {
                name: 'Platform Admin',
                description: 'Authenticate active platform administrators'
            },
            {
                name: 'Previous Year Tests',
                description: 'List, inspect, start, and submit mapped previous-year examination papers'
            },
            {
                name: 'Blog Templates',
                description: 'Platform-admin APIs for creating and managing reusable blog templates'
            },
            {
                name: 'Blog Categories',
                description: 'Platform-admin APIs for managing hierarchical blog categories'
            },
            {
                name: 'Blog Tags',
                description: 'Platform-admin APIs for managing searchable blog tags and tag statistics'
            },
            {
                name: 'Blog Authors',
                description: 'Platform-admin APIs for creating and managing blog authors'
            },
            {
                name: 'Author Following',
                description: 'Student APIs for browsing, following, and unfollowing active authors'
            },
            {
                name: 'Blog Engagement',
                description: 'Student APIs for browsing, liking, and saving published blogs'
            },
            {
                name: 'Blogs',
                description: 'Platform-admin CMS APIs for drafting, scheduling, publishing, and managing blogs'
            },
            {
                name: 'Blog Media',
                description: 'Platform-admin APIs for uploading and managing Cloudinary media'
            },
            {
                name: 'Blog SEO',
                description: 'Platform-admin APIs for managing meta, social, sitemap, and schema.org settings'
            },
            {
                name: 'Blog AI',
                description: 'Gemini-powered admin tools for SEO, editorial analysis, and content assistance'
            },
            {
                name: 'Blog Reviews',
                description: 'Student review submission, public approved reviews, and admin moderation'
            },
            {
                name: 'Blog Search',
                description: 'Public search across published and active blog content'
            },
            {
                name: 'Blog Analytics',
                description: 'Platform-admin live metrics, snapshots, growth, and content performance'
            },
            {
                name: 'Blog Pages',
                description: 'Public page-composition APIs for rendering the blog website'
            },
            {
                name: 'UCAT Platform Admin',
                description: 'Platform Admin APIs for managing UCAT questions, topics, test sessions, past papers, and dashboard analytics'
            },
            {
                name: 'UCAT Questions',
                description: 'Public APIs for fetching UCAT examination practice questions, section filtering, topics, and filters metadata'
            },
            {
                name: 'UCAT Topics',
                description: 'Public APIs for browsing UCAT topics, section topic lists, and topic details'
            },
            {
                name: 'UCAT Practice Tests',
                description: 'APIs for generating custom test sessions, timed answer submissions, score calculation, and test history'
            },
            {
                name: 'UCAT Previous Year Tests',
                description: 'APIs for listing and taking past UCAT examination papers'
            },
            {
                name: 'UCAT Streaks',
                description: 'APIs for tracking user daily practice activity and streak statistics'
            },
            {
                name: 'UCAT AI Review Chat',
                description: 'APIs for AI-assisted review chat sessions grounded in wrong test answers'
            },
            {
                name: 'UCAT Performance Insights',
                description: 'APIs for generating and retrieving section accuracy and weak/strong zone analytics'
            },
            {
                name: 'Student Dashboard',
                description: 'Personalized real-time student dashboard, KPI stats cards, performance metrics, and activity history'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter the JWT returned by the login API.'
                },
                adminBearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Paste only the JWT returned by POST /api/v1/admin/login. Do not type the Bearer prefix; Swagger adds it automatically.'
                }
            },
            schemas: {
                UcatTestStartRequest: {
                    type: 'object',
                    properties: {
                        student_id: { type: 'string', example: 'STU1784364902958UZ1WFH' },
                        subjects: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['DECISION_MAKING', 'VERBAL_REASONING']
                        },
                        chapters: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Reading Comprehension & Inference']
                        },
                        topic_ids: {
                            type: 'array',
                            items: { type: 'number' },
                            example: []
                        },
                        limit: { type: 'number', example: 20 },
                        duration: { type: 'number', example: 15 }
                    }
                },
                UcatTestSubmitRequest: {
                    type: 'object',
                    required: ['sessionId'],
                    properties: {
                        sessionId: { type: 'string', example: 'UCAT_TEST_1722458400000_123' },
                        answers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question_id: { type: 'number', example: 69 },
                                    selected_option: { type: 'string', example: 'A' },
                                    time_spent: { type: 'number', example: 24 }
                                }
                            }
                        }
                    }
                },
                UcatSubmitResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        score: { type: 'number', example: 6 },
                        correct: { type: 'number', example: 2 },
                        wrong: { type: 'number', example: 2 },
                        skipped: { type: 'number', example: 11 },
                        accuracy: { type: 'number', example: 13.33 },
                        review: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question_id: { type: 'number', example: 69 },
                                    selected: { type: 'string', example: 'A' },
                                    correct_answer: { type: 'string', example: 'D' },
                                    isCorrect: { type: 'boolean', example: false }
                                }
                            }
                        }
                    }
                },
                UcatResultResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                sessionId: { type: 'string', example: 'UCAT_TEST_1722458400000_123' },
                                test_type: { type: 'string', example: 'Quick Test' },
                                previous_year_paper_id: { type: 'string', example: null, nullable: true },
                                status: { type: 'string', example: 'Completed' },
                                score: { type: 'number', example: 6 },
                                correct: { type: 'number', example: 2 },
                                wrong: { type: 'number', example: 2 },
                                skipped: { type: 'number', example: 11 },
                                accuracy: { type: 'number', example: 13.33 },
                                total_questions: { type: 'number', example: 15 },
                                duration: { type: 'number', example: 15 },
                                started_at: { type: 'string', example: '2026-07-31T21:42:31.986Z' },
                                submitted_at: { type: 'string', example: '2026-07-31T21:43:25.187Z' },
                                total_time_spent: { type: 'number', example: 48 },
                                review: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 69 },
                                            question: { type: 'string', example: 'Staffing in the department rose from 25 to 40...' },
                                            option_a: { type: 'string', example: '14' },
                                            option_b: { type: 'string', example: '11' },
                                            option_c: { type: 'string', example: '27' },
                                            option_d: { type: 'string', example: '9' },
                                            correct_answer: { type: 'string', example: 'D' },
                                            explanation: { type: 'string', example: 'The passage states this directly...' },
                                            difficulty: { type: 'string', example: 'Easy' },
                                            question_type: { type: 'string', example: 'multiple_choice' },
                                            topic_id: { type: 'number', example: 101 },
                                            selected_option: { type: 'string', example: 'A' },
                                            is_correct: { type: 'boolean', example: false },
                                            marks_awarded: { type: 'number', example: -1 },
                                            time_spent: { type: 'number', example: 24 },
                                            is_skipped: { type: 'boolean', example: false }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                UcatStreakRecordRequest: {
                    type: 'object',
                    properties: {
                        activityType: { type: 'string', example: 'PRACTICE_TEST' }
                    }
                },
                UcatChatSessionCreateRequest: {
                    type: 'object',
                    required: ['testSessionId'],
                    properties: {
                        testSessionId: { type: 'string', example: 'UCAT_TEST_1722458400000_123' },
                        title: { type: 'string', example: 'Verbal Reasoning Test Review' }
                    }
                },
                UcatChatMessageSendRequest: {
                    type: 'object',
                    required: ['content'],
                    properties: {
                        content: { type: 'string', example: 'Why was option A correct for question 101 instead of option B?' }
                    }
                },
                UcatZoneInsightGenerateRequest: {
                    type: 'object',
                    required: ['testSessionId'],
                    properties: {
                        testSessionId: { type: 'string', example: 'UCAT_TEST_1722458400000_123' }
                    }
                },
                UcatTopic: {
                    type: 'object',
                    properties: {
                        topicId: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Reading Comprehension & Inference' },
                        section: {
                            type: 'string',
                            enum: ['VERBAL_REASONING', 'DECISION_MAKING', 'QUANTITATIVE_REASONING', 'SITUATIONAL_JUDGEMENT'],
                            example: 'VERBAL_REASONING'
                        },
                        description: { type: 'string', example: 'Evaluate conclusions drawn from passages.' },
                        icon: { type: 'string', example: '📖' },
                        order: { type: 'number', example: 1 },
                        status: { type: 'string', example: 'ACTIVE' }
                    }
                },
                UcatTopicNameItem: {
                    type: 'object',
                    properties: {
                        topicId: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Reading Comprehension & Inference' },
                        section: { type: 'string', example: 'VERBAL_REASONING' },
                        order: { type: 'number', example: 1 }
                    }
                },
                UcatTopicListResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'UCAT topics fetched successfully.' },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UcatTopic' }
                        }
                    }
                },
                UcatTopicNameListResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'UCAT topic list fetched successfully.' },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UcatTopicNameItem' }
                        }
                    }
                },
                UcatTopicSingleResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'UCAT topic fetched successfully.' },
                        data: { $ref: '#/components/schemas/UcatTopic' }
                    }
                },
                UcatOption: {
                    type: 'object',
                    properties: {
                        key: { type: 'string', example: 'A' },
                        text: { type: 'string', example: 'Conclusion follows logically' }
                    }
                },
                UcatQuestion: {
                    type: 'object',
                    properties: {
                        questionId: { type: 'number', example: 101 },
                        section: {
                            type: 'string',
                            enum: ['VERBAL_REASONING', 'DECISION_MAKING', 'QUANTITATIVE_REASONING', 'SITUATIONAL_JUDGEMENT'],
                            example: 'VERBAL_REASONING'
                        },
                        topic: { type: 'string', example: 'Inference' },
                        subtopic: { type: 'string', example: 'True/False/Cannot Tell' },
                        difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'], example: 'MEDIUM' },
                        questionType: { type: 'string', example: 'MULTIPLE_CHOICE' },
                        passageText: { type: 'string', example: 'Clinical trials demonstrate that treatment A is effective...' },
                        prompt: { type: 'string', example: 'Based on the passage, is the statement true?' },
                        options: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UcatOption' }
                        },
                        correctAnswer: { type: 'string', example: 'A' },
                        explanation: { type: 'string', example: 'The passage explicitly states...' },
                        status: { type: 'string', example: 'ACTIVE' }
                    }
                },
                UcatQuestionListResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'UCAT questions fetched successfully.' },
                        data: {
                            type: 'object',
                            properties: {
                                questions: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/UcatQuestion' }
                                },
                                total: { type: 'number', example: 50 },
                                page: { type: 'number', example: 1 },
                                limit: { type: 'number', example: 20 },
                                totalPages: { type: 'number', example: 3 }
                            }
                        }
                    }
                },
                UcatFiltersResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'UCAT question filters fetched successfully.' },
                        data: {
                            type: 'object',
                            properties: {
                                sections: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['VERBAL_REASONING', 'DECISION_MAKING', 'QUANTITATIVE_REASONING', 'SITUATIONAL_JUDGEMENT']
                                },
                                topics: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['Inference', 'Syllogisms', 'Venn Diagrams']
                                },
                                difficulties: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['EASY', 'MEDIUM', 'HARD']
                                }
                            }
                        }
                    }
                },
                SignupRequest: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'email', 'password', 'confirmPassword'],
                    properties: {
                        firstName: { type: 'string', example: 'sanjay' },
                        lastName: { type: 'string', example: 'kumar' },
                        email: { type: 'string', format: 'email', example: 'sanjay@example.com' },
                        phoneNumber: { type: 'string', pattern: '^\\d{10}$', example: '8903605604' },
                        password: { type: 'string', format: 'password', minLength: 8, example: 'password123' },
                        confirmPassword: { type: 'string', format: 'password', minLength: 8, example: 'password123' }
                    }
                },
                SignupOtpVerifyRequest: {
                    type: 'object',
                    required: ['phoneNumber', 'otp'],
                    properties: {
                        phoneNumber: { type: 'string', example: '8903605604' },
                        otp: { type: 'string', pattern: '^\\d{6}$', example: '483921' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'sanjay@example.com' },
                        password: { type: 'string', format: 'password', example: 'password123' }
                    }
                },
                GoogleLoginRequest: {
                    type: 'object',
                    required: ['idToken'],
                    properties: {
                        idToken: {
                            type: 'string',
                            description: 'Firebase ID token returned by getIdToken() after Google sign-in in the user frontend.'
                        }
                    }
                },
                RefreshTokenRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: {
                            type: 'string',
                            description: 'Refresh token returned by login, sign-up verification, or the previous refresh call.'
                        }
                    }
                },
                ForgotPasswordRequest: {
                    type: 'object',
                    required: ['phoneNumber'],
                    properties: {
                        phoneNumber: { type: 'string', example: '+918012036989' }
                    }
                },
                VerifyResetOtpRequest: {
                    type: 'object',
                    required: ['phoneNumber', 'otp'],
                    properties: {
                        phoneNumber: { type: 'string', example: '+918012036989' },
                        otp: { type: 'string', pattern: '^\\d{6}$', example: '483921' }
                    }
                },
                ResetPasswordRequest: {
                    type: 'object',
                    required: ['resetToken', 'password', 'confirmPassword'],
                    properties: {
                        resetToken: { type: 'string', description: 'One-time token returned by the OTP verification API.' },
                        password: { type: 'string', format: 'password', minLength: 8, example: 'newPassword123' },
                        confirmPassword: { type: 'string', format: 'password', minLength: 8, example: 'newPassword123' }
                    }
                },
                ChangePasswordRequest: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword', 'confirmPassword'],
                    properties: {
                        currentPassword: { type: 'string', format: 'password', example: 'password123' },
                        newPassword: { type: 'string', format: 'password', minLength: 8, example: 'newPassword123' },
                        confirmPassword: { type: 'string', format: 'password', minLength: 8, example: 'newPassword123' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'fail' },
                        message: { type: 'string', example: 'invalid credentials' }
                    }
                },
                BlogTemplateInput: {
                    type: 'object',
                    required: ['templateName'],
                    properties: {
                        templateName: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 100,
                            example: 'Country Guide'
                        },
                        description: {
                            type: 'string',
                            maxLength: 500,
                            example: 'Template for creating country guide articles.'
                        },
                        thumbnail: {
                            type: 'string',
                            format: 'uri',
                            example: 'https://example.com/template-thumbnail.jpg'
                        },
                        previewImages: {
                            type: 'array',
                            items: { type: 'string', format: 'uri' },
                            example: ['https://example.com/preview-1.jpg']
                        },
                        allowedSections: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['hero', 'overview', 'content', 'faq', 'relatedBlogs', 'cta']
                        },
                        displayOrder: { type: 'integer', minimum: 0, default: 0, example: 1 },
                        status: { type: 'boolean', default: true },
                        isDefault: { type: 'boolean', default: false },
                        metadata: {
                            type: 'object',
                            additionalProperties: true,
                            example: { category: 'education' }
                        }
                    }
                },
                BlogTemplateUpdateInput: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        templateName: { type: 'string', minLength: 3, maxLength: 100 },
                        description: { type: 'string', maxLength: 500 },
                        thumbnail: { type: 'string', format: 'uri' },
                        previewImages: { type: 'array', items: { type: 'string', format: 'uri' } },
                        allowedSections: { type: 'array', items: { type: 'string' } },
                        displayOrder: { type: 'integer', minimum: 0 },
                        status: { type: 'boolean' },
                        isDefault: { type: 'boolean' },
                        metadata: { type: 'object', additionalProperties: true }
                    }
                },
                BlogTemplate: {
                    allOf: [
                        { $ref: '#/components/schemas/BlogTemplateInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: '66a59ced88c5dcf13d81f030a' },
                                templateCode: { type: 'string', example: 'TMP_COUNTRY_GUIDE_8A12BC' },
                                version: { type: 'integer', example: 1 },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    ]
                },
                BlogTemplateError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Template not found.' }
                    }
                },
                BlogCategoryInput: {
                    type: 'object',
                    required: ['categoryName', 'categoryType'],
                    properties: {
                        categoryName: { type: 'string', minLength: 3, maxLength: 100, example: 'MBBS Abroad' },
                        categoryType: { type: 'string', enum: ['BLOG', 'EXAM', 'COUNTRY', 'UNIVERSITY', 'REVIEW', 'NEWS', 'SCHOLARSHIP', 'VISA', 'HOSTEL'], example: 'BLOG' },
                        description: { type: 'string', maxLength: 500, example: 'Guides and articles about studying MBBS abroad.' },
                        icon: { type: 'string', format: 'uri', example: 'https://example.com/icons/mbbs.png' },
                        bannerImage: { type: 'string', format: 'uri', example: 'https://example.com/banners/mbbs.jpg' },
                        parentCategory: { type: 'string', nullable: true, example: null },
                        displayOrder: { type: 'integer', minimum: 0, default: 0 },
                        isFeatured: { type: 'boolean', default: false },
                        status: { type: 'boolean', default: true },
                        seo: {
                            type: 'object',
                            properties: {
                                metaTitle: { type: 'string', maxLength: 160 },
                                metaDescription: { type: 'string', maxLength: 320 },
                                keywords: { type: 'array', items: { type: 'string' } },
                                canonicalUrl: { type: 'string', format: 'uri' }
                            }
                        },
                        metadata: { type: 'object', additionalProperties: true }
                    }
                },
                BlogCategory: {
                    allOf: [
                        { $ref: '#/components/schemas/BlogCategoryInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: '66a59ced88c5dcf13d81f030a' },
                                categoryCode: { type: 'string', example: 'CAT_MBBS_ABROAD_A3F6B2' },
                                slug: { type: 'string', example: 'mbbs-abroad' },
                                level: { type: 'integer', enum: [1, 2] },
                                totalBlogs: { type: 'integer', example: 0 },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    ]
                },
                BlogCategoryUpdateInput: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        categoryName: { type: 'string', minLength: 3, maxLength: 100 },
                        categoryType: { type: 'string', enum: ['BLOG', 'EXAM', 'COUNTRY', 'UNIVERSITY', 'REVIEW', 'NEWS', 'SCHOLARSHIP', 'VISA', 'HOSTEL'] },
                        description: { type: 'string', maxLength: 500 },
                        icon: { type: 'string', format: 'uri' },
                        bannerImage: { type: 'string', format: 'uri' },
                        parentCategory: { type: 'string', nullable: true },
                        displayOrder: { type: 'integer', minimum: 0 },
                        isFeatured: { type: 'boolean' },
                        status: { type: 'boolean' },
                        seo: { type: 'object' },
                        metadata: { type: 'object' }
                    }
                },
                BlogTagInput: {
                    type: 'object',
                    required: ['tagName'],
                    properties: {
                        tagName: { type: 'string', minLength: 2, maxLength: 100, example: 'Medical University' },
                        slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', example: 'medical-university' },
                        description: { type: 'string', maxLength: 500 },
                        tagType: { type: 'string', enum: ['COUNTRY', 'EXAM', 'UNIVERSITY', 'COURSE', 'SCHOLARSHIP', 'HOSTEL', 'VISA', 'NEWS', 'GENERAL'], default: 'GENERAL' },
                        color: { type: 'string', pattern: '^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$', default: '#2196F3' },
                        icon: { type: 'string', format: 'uri' },
                        bannerImage: { type: 'string', format: 'uri' },
                        displayOrder: { type: 'integer', minimum: 0, default: 0 },
                        isFeatured: { type: 'boolean', default: false },
                        status: { type: 'boolean', default: true },
                        seo: {
                            type: 'object',
                            properties: {
                                metaTitle: { type: 'string', maxLength: 160 },
                                metaDescription: { type: 'string', maxLength: 320 },
                                keywords: { type: 'array', items: { type: 'string' } },
                                canonicalUrl: { type: 'string', format: 'uri' }
                            }
                        },
                        metadata: { type: 'object', additionalProperties: true }
                    }
                },
                BlogTagUpdateInput: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        tagName: { type: 'string', minLength: 2, maxLength: 100 },
                        slug: { type: 'string' },
                        description: { type: 'string', maxLength: 500 },
                        tagType: { type: 'string', enum: ['COUNTRY', 'EXAM', 'UNIVERSITY', 'COURSE', 'SCHOLARSHIP', 'HOSTEL', 'VISA', 'NEWS', 'GENERAL'] },
                        color: { type: 'string' },
                        icon: { type: 'string', format: 'uri' },
                        bannerImage: { type: 'string', format: 'uri' },
                        displayOrder: { type: 'integer', minimum: 0 },
                        isFeatured: { type: 'boolean' },
                        status: { type: 'boolean' },
                        seo: { type: 'object' },
                        metadata: { type: 'object' }
                    }
                },
                BlogTag: {
                    allOf: [
                        { $ref: '#/components/schemas/BlogTagInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: '66a59ced88c5dcf13d81f030a' },
                                tagCode: { type: 'string', example: 'TAG_MEDICAL_UNIVERSITY_A2F9B8' },
                                totalBlogs: { type: 'integer', example: 0 },
                                totalViews: { type: 'integer', example: 0 },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    ]
                },
                BlogAuthorInput: {
                    type: 'object',
                    required: ['fullName', 'email'],
                    properties: {
                        fullName: { type: 'string', minLength: 2, maxLength: 100, example: 'Dr. Sanjay Kumar' },
                        slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', example: 'dr-sanjay-kumar' },
                        email: { type: 'string', format: 'email', example: 'sanjay@example.com' },
                        phone: { type: 'string', pattern: '^[+]?[0-9]{7,15}$', example: '+918903605604' },
                        designation: { type: 'string', maxLength: 150, example: 'Medical Content Specialist' },
                        bio: { type: 'string', maxLength: 3000, example: 'Medical author specializing in NEET preparation.' },
                        authorType: {
                            type: 'string',
                            enum: ['ADMIN', 'EDITOR', 'COUNSELOR', 'DOCTOR', 'UNIVERSITY_REPRESENTATIVE', 'GUEST_AUTHOR'],
                            default: 'EDITOR'
                        },
                        profileImage: { type: 'string', example: 'https://example.com/profile.jpg' },
                        coverImage: { type: 'string', example: 'https://example.com/cover.jpg' },
                        experience: { type: 'integer', minimum: 0, default: 0, example: 5 },
                        qualifications: { type: 'array', uniqueItems: true, items: { type: 'string' }, example: ['MBBS', 'MD'] },
                        specializations: { type: 'array', uniqueItems: true, items: { type: 'string' }, example: ['Biology'] },
                        languages: { type: 'array', uniqueItems: true, items: { type: 'string' }, example: ['English', 'Tamil'] },
                        country: { type: 'string', example: 'India' },
                        city: { type: 'string', example: 'Chennai' },
                        socialLinks: {
                            type: 'object',
                            properties: {
                                website: { type: 'string', example: 'https://example.com' },
                                linkedin: { type: 'string', example: 'https://linkedin.com/in/sanjay' },
                                facebook: { type: 'string' },
                                instagram: { type: 'string' },
                                twitter: { type: 'string' },
                                youtube: { type: 'string' }
                            }
                        },
                        isFeatured: { type: 'boolean', default: false },
                        status: { type: 'boolean', default: true },
                        displayOrder: { type: 'integer', minimum: 0, default: 0 },
                        seo: {
                            type: 'object',
                            properties: {
                                metaTitle: { type: 'string', maxLength: 200 },
                                metaDescription: { type: 'string', maxLength: 500 },
                                keywords: { type: 'array', uniqueItems: true, items: { type: 'string' } },
                                canonicalUrl: { type: 'string' }
                            }
                        },
                        metadata: { type: 'object', additionalProperties: true }
                    }
                },
                BlogAuthorUpdateInput: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        fullName: { type: 'string', minLength: 2, maxLength: 100 },
                        slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string', pattern: '^[+]?[0-9]{7,15}$' },
                        designation: { type: 'string', maxLength: 150 },
                        bio: { type: 'string', maxLength: 3000 },
                        authorType: { type: 'string', enum: ['ADMIN', 'EDITOR', 'COUNSELOR', 'DOCTOR', 'UNIVERSITY_REPRESENTATIVE', 'GUEST_AUTHOR'] },
                        profileImage: { type: 'string' },
                        coverImage: { type: 'string' },
                        experience: { type: 'integer', minimum: 0 },
                        qualifications: { type: 'array', uniqueItems: true, items: { type: 'string' } },
                        specializations: { type: 'array', uniqueItems: true, items: { type: 'string' } },
                        languages: { type: 'array', uniqueItems: true, items: { type: 'string' } },
                        country: { type: 'string' },
                        city: { type: 'string' },
                        socialLinks: { type: 'object' },
                        isFeatured: { type: 'boolean' },
                        status: { type: 'boolean' },
                        displayOrder: { type: 'integer', minimum: 0 },
                        seo: { type: 'object' },
                        metadata: { type: 'object' }
                    }
                },
                BlogAuthor: {
                    allOf: [
                        { $ref: '#/components/schemas/BlogAuthorInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: '66a59ced88c5dcf13d81f030a' },
                                authorCode: { type: 'string', example: 'AUT_DR_SANJAY_KUMAR_A2F9B8' },
                                totalBlogs: { type: 'integer', example: 0 },
                                totalViews: { type: 'integer', example: 0 },
                                totalLikes: { type: 'integer', example: 0 },
                                totalComments: { type: 'integer', example: 0 },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    ]
                },
                BlogInput: {
                    type: 'object',
                    required: ['title', 'content', 'template', 'category', 'author'],
                    properties: {
                        title: { type: 'string', minLength: 10, maxLength: 250, example: 'Complete NEET Biology Preparation Guide' },
                        slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
                        shortDescription: { type: 'string', maxLength: 500 },
                        excerpt: { type: 'string', maxLength: 1000 },
                        content: { type: 'object', additionalProperties: true, example: { blocks: [{ type: 'paragraph', text: 'Start your NEET preparation with NCERT.' }] } },
                        blogType: { type: 'string', enum: ['BLOG', 'NEWS', 'ARTICLE', 'GUIDE', 'FAQ', 'CASE_STUDY'], default: 'BLOG' },
                        template: { type: 'string', description: 'Active BlogTemplate MongoDB _id.' },
                        category: { type: 'string', description: 'Active BlogCategory MongoDB _id.' },
                        tags: { type: 'array', maxItems: 20, uniqueItems: true, items: { type: 'string' } },
                        author: { type: 'string', description: 'Active BlogAuthor MongoDB _id.' },
                        featuredImage: { type: 'object', properties: { url: { type: 'string' }, alt: { type: 'string' }, caption: { type: 'string' } } },
                        gallery: { type: 'array', maxItems: 30, items: { type: 'object', properties: { url: { type: 'string' }, alt: { type: 'string' } } } },
                        videos: { type: 'array', maxItems: 20, items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' } } } },
                        visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE', 'PASSWORD'], default: 'PUBLIC' },
                        password: { type: 'string', description: 'Required for PASSWORD visibility and stored as a bcrypt hash.', writeOnly: true },
                        isFeatured: { type: 'boolean', default: false },
                        isTrending: { type: 'boolean', default: false },
                        isPinned: { type: 'boolean', default: false },
                        seo: { type: 'object', properties: { metaTitle: { type: 'string' }, metaDescription: { type: 'string' }, keywords: { type: 'array', items: { type: 'string' } }, canonicalUrl: { type: 'string' }, robots: { type: 'string', enum: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'] } } },
                        faqs: { type: 'array', maxItems: 20, items: { type: 'object', required: ['question', 'answer'], properties: { question: { type: 'string' }, answer: { type: 'string' } } } },
                        relatedBlogs: { type: 'array', maxItems: 20, uniqueItems: true, items: { type: 'string' } },
                        metadata: { type: 'object', additionalProperties: true }
                    }
                },
                BlogUpdateInput: {
                    type: 'object',
                    minProperties: 1,
                    description: 'Partial BlogInput. Send only fields that need to change.',
                    additionalProperties: true,
                    example: { title: 'Updated NEET Biology Preparation Guide', isFeatured: true }
                },
                Blog: {
                    allOf: [
                        { $ref: '#/components/schemas/BlogInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                blogCode: { type: 'string', example: 'BLOG_COMPLETE_NEET_BIOLOGY_GUIDE_A2F9B8' },
                                status: { type: 'string', enum: ['DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] },
                                readingTime: { type: 'integer' },
                                totalViews: { type: 'integer' },
                                totalLikes: { type: 'integer' },
                                totalShares: { type: 'integer' },
                                totalComments: { type: 'integer' },
                                publishedAt: { type: 'string', format: 'date-time', nullable: true },
                                scheduledAt: { type: 'string', format: 'date-time', nullable: true },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    ]
                },
                BlogMedia: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        originalName: { type: 'string' },
                        displayName: { type: 'string' },
                        fileName: { type: 'string' },
                        publicId: { type: 'string' },
                        assetId: { type: 'string' },
                        url: { type: 'string' },
                        secureUrl: { type: 'string' },
                        folder: { type: 'string' },
                        format: { type: 'string' },
                        extension: { type: 'string' },
                        mimeType: { type: 'string' },
                        resourceType: { type: 'string', enum: ['image', 'video', 'raw'] },
                        width: { type: 'number' },
                        height: { type: 'number' },
                        duration: { type: 'number' },
                        bytes: { type: 'integer' },
                        readableSize: { type: 'string' },
                        altText: { type: 'string' },
                        caption: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        status: { type: 'string', enum: ['ACTIVE', 'DELETED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                BlogMediaMetadata: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        displayName: { type: 'string', maxLength: 250 },
                        altText: { type: 'string', maxLength: 500 },
                        caption: { type: 'string', maxLength: 1000 },
                        tags: { type: 'array', uniqueItems: true, items: { type: 'string' } }
                    }
                },
                BlogSeoInput: {
                    type: 'object',
                    required: ['module', 'referenceId', 'slug', 'metaTitle', 'metaDescription'],
                    properties: {
                        module: { type: 'string', enum: ['BLOG', 'PAGE', 'AUTHOR', 'CATEGORY', 'TAG', 'COUNTRY', 'UNIVERSITY', 'HOME', 'SERVICE'] },
                        referenceId: { type: 'string', example: '6a630000d3310d5292509999' },
                        slug: { type: 'string', minLength: 3, maxLength: 200, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', example: 'complete-neet-biology-guide' },
                        canonicalUrl: { type: 'string', example: 'https://example.com/blogs/complete-neet-biology-guide' },
                        metaTitle: { type: 'string', minLength: 10, maxLength: 60, example: 'Complete NEET Biology Guide' },
                        metaDescription: { type: 'string', minLength: 50, maxLength: 160, example: 'Prepare for NEET Biology with a complete NCERT study and revision strategy for medical aspirants.' },
                        metaKeywords: { type: 'array', maxItems: 15, uniqueItems: true, items: { type: 'string' }, example: ['NEET', 'Biology', 'NCERT'] },
                        robots: { type: 'string', enum: ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'], default: 'index,follow' },
                        openGraph: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, image: { type: 'string', nullable: true, description: 'BlogMedia MongoDB ID.' }, imageAlt: { type: 'string' }, type: { type: 'string', enum: ['website', 'article', 'profile', 'book'] } } },
                        twitter: { type: 'object', properties: { card: { type: 'string', enum: ['summary', 'summary_large_image', 'app', 'player'] }, title: { type: 'string' }, description: { type: 'string' }, image: { type: 'string', nullable: true } } },
                        sitemap: { type: 'object', properties: { priority: { type: 'number', minimum: 0, maximum: 1, default: 0.8 }, changeFrequency: { type: 'string', enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] } } },
                        schemaType: { type: 'string', enum: ['Article', 'BlogPosting', 'FAQPage', 'Organization', 'Person', 'WebSite', 'WebPage', 'BreadcrumbList', 'LocalBusiness'] },
                        schemaData: { type: 'object', additionalProperties: true },
                        redirectUrl: { type: 'string' },
                        isActive: { type: 'boolean', default: true }
                    }
                },
                BlogSeoUpdateInput: {
                    type: 'object',
                    minProperties: 1,
                    additionalProperties: true,
                    example: { metaTitle: 'Updated NEET Biology Guide', robots: 'index,follow', isActive: true }
                },
                BlogReviewInput: {
                    type: 'object',
                    required: ['reviewType', 'referenceId', 'reviewerName', 'title', 'review', 'rating'],
                    properties: {
                        reviewType: { type: 'string', enum: ['UNIVERSITY', 'COUNTRY', 'BLOG', 'CONSULTANT', 'AUTHOR', 'WEBSITE'] },
                        referenceId: { type: 'string', example: '6a630000d3310d5292509999' },
                        reviewerName: { type: 'string', minLength: 2, maxLength: 100, example: 'Sanjay Kumar' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        country: { type: 'string' },
                        city: { type: 'string' },
                        title: { type: 'string', minLength: 5, maxLength: 150, example: 'Very useful preparation guide' },
                        review: { type: 'string', minLength: 20, maxLength: 5000, example: 'This guide was detailed and very useful for my NEET preparation.' },
                        rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                        media: { type: 'array', maxItems: 10, items: { type: 'object', required: ['mediaId'], properties: { mediaId: { type: 'string' }, mediaType: { type: 'string', enum: ['IMAGE', 'VIDEO'] } } } }
                    }
                },
                BlogReviewUpdateInput: {
                    type: 'object',
                    minProperties: 1,
                    properties: {
                        reviewerName: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        country: { type: 'string' },
                        city: { type: 'string' },
                        title: { type: 'string' },
                        review: { type: 'string' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        media: { type: 'array', items: { type: 'object' } }
                    }
                },
                BlogAdvancedSearchInput: {
                    type: 'object',
                    required: ['keyword'],
                    properties: {
                        keyword: { type: 'string', minLength: 2, maxLength: 100, example: 'NEET Biology' },
                        module: { type: 'string', enum: ['GLOBAL', 'BLOG', 'CATEGORY', 'TAG', 'AUTHOR', 'REVIEW', 'SEO', 'MEDIA'], default: 'GLOBAL' },
                        category: { type: 'string', description: 'BlogCategory MongoDB ID.' },
                        author: { type: 'string', description: 'BlogAuthor MongoDB ID.' },
                        tag: { type: 'string', description: 'BlogTag MongoDB ID.' },
                        rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Applies to REVIEW searches.' },
                        sortBy: { type: 'string', enum: ['relevance', 'createdAt', 'updatedAt', 'title', 'name', 'rating', 'popularity'], default: 'relevance' },
                        sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
                        page: { type: 'integer', minimum: 1, default: 1 },
                        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
                    }
                },
                BlogAnalyticsSnapshot: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        date: { type: 'string', format: 'date' },
                        period: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] },
                        dashboard: { type: 'object', properties: { totalBlogs: { type: 'integer' }, publishedBlogs: { type: 'integer' }, draftBlogs: { type: 'integer' }, totalCategories: { type: 'integer' }, totalTags: { type: 'integer' }, totalAuthors: { type: 'integer' } } },
                        reviews: { type: 'object', properties: { totalReviews: { type: 'integer' }, approvedReviews: { type: 'integer' }, pendingReviews: { type: 'integer' }, rejectedReviews: { type: 'integer' }, averageRating: { type: 'number' } } },
                        searches: { type: 'object', description: 'Zero until search event tracking is implemented.' },
                        media: { type: 'object', properties: { totalFiles: { type: 'integer' }, totalImages: { type: 'integer' }, totalVideos: { type: 'integer' }, storageUsed: { type: 'integer', description: 'Total bytes.' } } },
                        seo: { type: 'object', properties: { indexedPages: { type: 'integer' }, missingMetaTitles: { type: 'integer' }, missingMetaDescriptions: { type: 'integer' }, averageSeoScore: { type: 'number' } } },
                        traffic: { type: 'object', description: 'pageViews comes from blog counters; visitor fields require event tracking.' },
                        growth: { type: 'object', properties: { blogGrowth: { type: 'number' }, reviewGrowth: { type: 'number' }, searchGrowth: { type: 'number' }, visitorGrowth: { type: 'number' } } },
                        generatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                TestSelectionRequest: {
                    type: 'object',
                    required: ['subjects'],
                    properties: {
                        subjects: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'string',
                                enum: ['Physics', 'Chemistry', 'Botany', 'Zoology']
                            },
                            example: ['Physics']
                        }
                    }
                },
                TestTopicRequest: {
                    allOf: [
                        { $ref: '#/components/schemas/TestSelectionRequest' },
                        {
                            type: 'object',
                            required: ['chapters'],
                            properties: {
                                chapters: {
                                    type: 'array',
                                    minItems: 1,
                                    items: { type: 'string' },
                                    example: ['Units and Measurements']
                                }
                            }
                        }
                    ]
                },
                StartQuickTestRequest: {
                    allOf: [
                        { $ref: '#/components/schemas/TestTopicRequest' },
                        {
                            type: 'object',
                            required: ['questionCount', 'duration'],
                            properties: {
                                questionCount: {
                                    type: 'integer',
                                    enum: [15, 20, 25, 30, 35, 40],
                                    example: 15
                                },
                                duration: {
                                    type: 'integer',
                                    minimum: 1,
                                    maximum: 30,
                                    description: 'Test duration in minutes.',
                                    example: 15
                                }
                            }
                        }
                    ]
                },
                TestQuestion: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1001 },
                        question: { type: 'string', example: 'What is the SI unit of force?' },
                        option_a: { type: 'string', example: 'Joule' },
                        option_b: { type: 'string', example: 'Newton' },
                        option_c: { type: 'string', example: 'Watt' },
                        option_d: { type: 'string', example: 'Pascal' },
                        difficulty: { type: 'string', example: 'Easy' },
                        question_type: { type: 'string', example: 'Single Correct Answer' },
                        topic_id: { type: 'integer', example: 101 }
                    }
                },
                SubmitTestRequest: {
                    type: 'object',
                    required: ['sessionId', 'answers'],
                    properties: {
                        sessionId: {
                            type: 'string',
                            description: 'Session ID returned by the start-test API.',
                            example: '6879c11b92eaed84fcf156c1'
                        },
                        answers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['question_id', 'selected_option'],
                                properties: {
                                    question_id: { type: 'integer', example: 1001 },
                                    selected_option: {
                                        type: 'string',
                                        enum: ['A', 'B', 'C', 'D'],
                                        example: 'B'
                                    },
                                    time_spent: {
                                        type: 'number',
                                        minimum: 0,
                                        description: 'Optional time spent on this question in seconds; used for insight timing calculations.',
                                        example: 18
                                    }
                                }
                            }
                        }
                    }
                },
                TestErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'An error occurred.' }
                    }
                },
                CreateChatSessionRequest: {
                    type: 'object',
                    required: ['testSessionId'],
                    properties: {
                        testSessionId: {
                            type: 'string',
                            description: 'A completed test session belonging to the logged-in student.',
                            example: '6a59c9163133406e11373f53'
                        },
                        title: {
                            type: 'string',
                            maxLength: 120,
                            example: 'Physics Wrong Answers Review'
                        }
                    }
                },
                UpdateChatSessionRequest: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: {
                            type: 'string',
                            maxLength: 120,
                            example: 'Mechanics Review'
                        }
                    }
                },
                SendChatMessageRequest: {
                    type: 'object',
                    required: ['message'],
                    properties: {
                        message: {
                            type: 'string',
                            maxLength: 4000,
                            example: 'Explain why my answer to question 1001 was wrong.'
                        }
                    }
                },
                ChatSession: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '687b51de7277aa31465561fd' },
                        test_session_id: { type: 'string', example: '6a59c9163133406e11373f53' },
                        title: { type: 'string', example: 'Physics Wrong Answers Review' },
                        wrong_question_ids: {
                            type: 'array',
                            items: { type: 'integer' },
                            example: [1001, 1005]
                        },
                        is_active: { type: 'boolean', example: true },
                        last_message_at: { type: 'string', format: 'date-time' }
                    }
                },
                ChatMessage: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '687b52647277aa3146556201' },
                        role: { type: 'string', enum: ['user', 'assistant'], example: 'assistant' },
                        content: { type: 'string', example: 'Your selected option is incorrect because...' },
                        model: { type: 'string', nullable: true, example: 'gemini-3.5-flash' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                QuestionOfTheDay: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 4029 },
                        question_date: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-07-16T00:00:00.000Z'
                        },
                        question: {
                            type: 'string',
                            example: 'Which organelle is known as the powerhouse of the cell?'
                        },
                        option_a: { type: 'string', example: 'Nucleus' },
                        option_b: { type: 'string', example: 'Mitochondrion' },
                        option_c: { type: 'string', example: 'Ribosome' },
                        option_d: { type: 'string', example: 'Golgi apparatus' },
                        difficulty: {
                            type: 'string',
                            enum: ['Easy', 'Medium', 'Hard'],
                            example: 'Easy'
                        },
                        question_type: { type: 'string', example: 'Single Correct Answer' },
                        topic_id: { type: 'integer', example: 12 },
                        alreadyAnswered: {
                            type: 'boolean',
                            description: 'Whether the logged-in student has already submitted an answer.',
                            example: false
                        }
                    }
                },
                QuestionSubmissionRequest: {
                    type: 'object',
                    required: ['question_id', 'selected_option'],
                    properties: {
                        question_id: {
                            type: 'integer',
                            description: 'The numeric ID returned by the Question of the Day API.',
                            example: 4029
                        },
                        selected_option: {
                            type: 'string',
                            enum: ['A', 'B', 'C', 'D'],
                            description: 'The option selected by the student.',
                            example: 'B'
                        }
                    }
                },
                QuestionSubmissionResult: {
                    type: 'object',
                    properties: {
                        question_id: { type: 'integer', example: 101 },
                        selected_option: { type: 'string', enum: ['A', 'B', 'C', 'D'], example: 'B' },
                        correct_answer: { type: 'string', enum: ['A', 'B', 'C', 'D'], example: 'B' },
                        is_correct: { type: 'boolean', example: true },
                        explanation: {
                            type: 'string',
                            example: 'Mitochondria produce most of the cell\'s ATP.'
                        },
                        streak: { $ref: '#/components/schemas/QodStreak' }
                    }
                },
                QodStreak: {
                    type: 'object',
                    properties: {
                        current_streak: { type: 'integer', minimum: 0, example: 5 },
                        longest_streak: { type: 'integer', minimum: 0, example: 12 },
                        total_days_answered: { type: 'integer', minimum: 0, example: 30 },
                        correct_answer_count: { type: 'integer', minimum: 0, example: 24 },
                        last_answered_date: { type: 'string', nullable: true, example: '2026-07-25' },
                        streak_started_at: { type: 'string', nullable: true, example: '2026-07-21' },
                        answered_today: { type: 'boolean', example: true },
                        today_correct: { type: 'boolean', nullable: true, example: true },
                        timezone: { type: 'string', example: 'Asia/Kolkata' }
                    }
                },
                QodStreakHistoryEntry: {
                    type: 'object',
                    properties: {
                        date: { type: 'string', example: '2026-07-25' },
                        answered: { type: 'boolean', example: true },
                        is_correct: { type: 'boolean', example: true },
                        question_id: { type: 'integer', example: 4029 }
                    }
                },
                AIContentRequest: {
                    type: 'object',
                    required: ['title', 'content'],
                    properties: {
                        title: { type: 'string', minLength: 2, maxLength: 250, example: 'NEET 2027 Preparation Guide' },
                        content: { type: 'string', minLength: 20, maxLength: 50000, example: 'A complete guide for students preparing for NEET 2027...' },
                        targetAudience: { type: 'string', maxLength: 200, default: 'NEET and MBBS aspirants' },
                        primaryKeyword: { type: 'string', maxLength: 150, example: 'NEET 2027 preparation' }
                    }
                },
                AIResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'SEO generated successfully.' },
                        data: { type: 'object', additionalProperties: true },
                        meta: {
                            type: 'object',
                            properties: {
                                feature: { type: 'string', example: 'SEO' },
                                model: { type: 'string', example: 'gemini-3.5-flash' },
                                duration_ms: { type: 'integer', example: 1840 },
                                prompt_tokens: { type: 'integer', example: 420 },
                                output_tokens: { type: 'integer', example: 180 }
                            }
                        }
                    }
                },
                // StudentActivity: {
                //     type: 'object',
                //     properties: {
                //         _id: { type: 'string', example: '6a574d89f8cfe3af28d29008' },
                //         id: { type: 'integer', example: 206 },
                //         student_id: { type: 'string', example: 'MOB26070968IUXQ' },
                //         last_seen: { type: 'string', format: 'date-time', example: '2026-07-09T16:10:35.536Z' },
                //         ip_address: { type: 'string', example: '127.0.0.1' },
                //         user_agent: { type: 'string', example: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
                //     }
                // },
                UserActivityRequest: {
                    type: 'object',
                    required: ['user_id'],
                    properties: {
                        user_id: { type: 'integer', minimum: 1, example: 3 }
                    }
                },
                UserActivity: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '6a574cb5f8cfe3af28d28fd3' },
                        id: { type: 'integer', example: 4 },
                        user_id: { type: 'integer', example: 3 },
                        last_seen: { type: 'string', format: 'date-time', example: '2026-02-18T09:47:54.148Z' },
                        ip_address: { type: 'string', example: '127.0.0.1' },
                        user_agent: { type: 'string', example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                    }
                },
                UserLoginActivity: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '6a6a28502a1e32be268ed1a0' },
                        user_id: { type: 'string', example: '6a69cae58d322957929252f1' },
                        student_id: { type: 'string', example: 'STU1750000000000ABC123' },
                        email: { type: 'string', format: 'email', example: 'student@example.com' },
                        first_name: { type: 'string', example: 'student' },
                        last_name: { type: 'string', example: 'user' },
                        event_type: { type: 'string', enum: ['login'], example: 'login' },
                        auth_method: { type: 'string', enum: ['password'], example: 'password' },
                        login_at: { type: 'string', format: 'date-time' },
                        session_id: { type: 'string' },
                        ip_address: { type: 'string', example: '203.0.113.10' },
                        user_agent: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                StudentProfileRequest: {
                    type: 'object',
                    properties: {
                        phone_number: { type: 'string', example: '+918012036989' },
                        email: { type: 'string', format: 'email', example: 'student@example.com' },
                        full_name: { type: 'string', maxLength: 120, example: 'Sanjay Kumar' },
                        date_of_birth: { type: 'string', format: 'date', example: '2007-06-15' },
                        school_name: { type: 'string', maxLength: 200, example: 'NEET Higher Secondary School' },
                        target_exam_year: { type: 'integer', example: 2027 },
                        auth_provider: { type: 'string', enum: ['mobile', 'local', 'google'], example: 'mobile' }
                    }
                },
                // StudentProfile: {
                //     type: 'object',
                //     properties: {
                //         _id: { type: 'string', example: '6a574a45f8cfe3af28d28f8b' },
                //         student_id: { type: 'string', example: 'MOB260328RVFUYR' },
                //         phone_number: { type: 'string', example: '+918012036989' },
                //         is_active: { type: 'boolean', example: true },
                //         is_verified: { type: 'boolean', example: true },
                //         last_login: { type: 'string', format: 'date-time' },
                //         created_at: { type: 'string', format: 'date-time' },
                //         updated_at: { type: 'string', format: 'date-time' },
                //         auth_provider: { type: 'string', example: 'mobile' },
                //         email_verified: { type: 'boolean', example: false },
                //         is_first_login: { type: 'boolean', example: true }
                //     }
                // },
                QuestionFeedbackRequest: {
                    type: 'object',
                    required: ['test_session_id', 'question_id', 'feedback_type', 'comment'],
                    properties: {
                        test_session_id: {
                            type: 'string',
                            example: '6a59c9163133406e11373f53'
                        },
                        question_id: { type: 'integer', example: 1001 },
                        feedback_type: {
                            type: 'string',
                            enum: ['incorrect_question', 'incorrect_answer', 'incorrect_explanation', 'typo', 'other'],
                            example: 'incorrect_explanation'
                        },
                        comment: {
                            type: 'string',
                            maxLength: 1000,
                            example: 'The explanation does not match the correct option.'
                        }
                    }
                },
                QuestionFeedback: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        student_id: { type: 'string', example: 'MOB260328RVFUYR' },
                        test_session_id: { type: 'string', example: '6a59c9163133406e11373f53' },
                        question_id: { type: 'integer', example: 1001 },
                        feedback_type: { type: 'string', example: 'incorrect_explanation' },
                        comment: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'reviewed', 'resolved', 'rejected'], example: 'pending' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                ReviewCommentRequest: {
                    type: 'object',
                    required: ['review_type', 'comment'],
                    properties: {
                        review_type: {
                            type: 'string',
                            enum: ['app', 'test', 'chatbot', 'question', 'other'],
                            example: 'test'
                        },
                        rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                        comment: {
                            type: 'string',
                            maxLength: 2000,
                            example: 'The test experience was useful and the explanations were clear.'
                        },
                        test_session_id: {
                            type: 'string',
                            nullable: true,
                            description: 'Optional test session belonging to the logged-in student.',
                            example: '6a59c9163133406e11373f53'
                        }
                    }
                },
                ReviewComment: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user_id: { type: 'string' },
                        student_id: { type: 'string', example: 'MOB260328RVFUYR' },
                        review_type: { type: 'string', example: 'test' },
                        rating: { type: 'integer', nullable: true, example: 4 },
                        comment: { type: 'string' },
                        test_session_id: { type: 'string', nullable: true },
                        status: { type: 'string', example: 'pending' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                NotificationRequest: {
                    type: 'object',
                    required: ['title', 'message'],
                    properties: {
                        title: { type: 'string', maxLength: 150, example: 'Test completed' },
                        message: { type: 'string', maxLength: 1000, example: 'Your test result and insights are ready.' },
                        notification_type: {
                            type: 'string',
                            enum: ['system', 'test', 'qod', 'chatbot', 'account', 'reminder'],
                            default: 'system',
                            example: 'test'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'normal', 'high'],
                            default: 'normal',
                            example: 'normal'
                        },
                        action_url: { type: 'string', nullable: true, example: '/tests/results/6a59c9163133406e11373f53' },
                        data: { type: 'object', nullable: true, additionalProperties: true }
                    }
                },
                Notification: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        user_id: { type: 'string' },
                        student_id: { type: 'string', example: 'STU1784270552819BG1KRS' },
                        title: { type: 'string' },
                        message: { type: 'string' },
                        notification_type: { type: 'string', example: 'test' },
                        priority: { type: 'string', example: 'normal' },
                        action_url: { type: 'string', nullable: true },
                        data: { type: 'object', nullable: true, additionalProperties: true },
                        is_read: { type: 'boolean', example: false },
                        read_at: { type: 'string', format: 'date-time', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                StudentAuthorCard: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '66a59ced88c5dcf13d81f030' },
                        authorCode: { type: 'string', example: 'AUT_DR_SANJAY_KUMAR_A1B2C3' },
                        fullName: { type: 'string', example: 'Dr. Sanjay Kumar' },
                        slug: { type: 'string', example: 'dr-sanjay-kumar' },
                        designation: { type: 'string', example: 'Senior Medical Content Specialist' },
                        bio: { type: 'string', example: 'Medical author specializing in NEET preparation.' },
                        authorType: { type: 'string', example: 'DOCTOR' },
                        profileImage: { type: 'string', nullable: true },
                        coverImage: { type: 'string', nullable: true },
                        experience: { type: 'integer', example: 10 },
                        qualifications: { type: 'array', items: { type: 'string' } },
                        specializations: { type: 'array', items: { type: 'string' } },
                        languages: { type: 'array', items: { type: 'string' } },
                        totalBlogs: { type: 'integer', example: 4 },
                        isFeatured: { type: 'boolean', example: true },
                        followerCount: { type: 'integer', example: 125 },
                        isFollowing: { type: 'boolean', example: true },
                        followedAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: '2026-07-27T15:30:00.000Z'
                        }
                    }
                },
                AuthorFollowState: {
                    type: 'object',
                    properties: {
                        authorId: { type: 'string', example: '66a59ced88c5dcf13d81f030' },
                        isFollowing: { type: 'boolean', example: true },
                        followerCount: { type: 'integer', example: 125 },
                        followedAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true
                        }
                    }
                },
                AuthorListData: {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/StudentAuthorCard' }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 20 },
                                total: { type: 'integer', example: 1 },
                                totalPages: { type: 'integer', example: 1 }
                            }
                        }
                    }
                },
                StudentBlogCard: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '66a59ced88c5dcf13d81f030' },
                        blogCode: { type: 'string', example: 'BLOG_NEET_PREPARATION_A1B2C3' },
                        title: { type: 'string', example: 'How to Prepare for NEET' },
                        slug: { type: 'string', example: 'how-to-prepare-for-neet' },
                        shortDescription: { type: 'string' },
                        excerpt: { type: 'string' },
                        content: { type: 'object', additionalProperties: true },
                        blogType: { type: 'string', example: 'BLOG' },
                        featuredImage: {
                            type: 'object',
                            properties: {
                                url: { type: 'string', format: 'uri' },
                                alt: { type: 'string' },
                                caption: { type: 'string' }
                            }
                        },
                        author: { type: 'object', additionalProperties: true },
                        category: { type: 'object', additionalProperties: true },
                        tags: { type: 'array', items: { type: 'object', additionalProperties: true } },
                        readingTime: { type: 'integer', example: 6 },
                        totalViews: { type: 'integer', example: 500 },
                        totalLikes: { type: 'integer', example: 42 },
                        totalShares: { type: 'integer', example: 10 },
                        publishedAt: { type: 'string', format: 'date-time' },
                        isFeatured: { type: 'boolean' },
                        isTrending: { type: 'boolean' },
                        isLiked: { type: 'boolean', example: true },
                        likedAt: { type: 'string', format: 'date-time', nullable: true },
                        isSaved: { type: 'boolean', example: true },
                        savedAt: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                StudentBlogListData: {
                    type: 'object',
                    properties: {
                        blogs: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/StudentBlogCard' }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 20 },
                                total: { type: 'integer', example: 10 },
                                totalPages: { type: 'integer', example: 1 }
                            }
                        }
                    }
                },
                BlogLikeState: {
                    type: 'object',
                    properties: {
                        blogId: { type: 'string', example: '66a59ced88c5dcf13d81f030' },
                        isLiked: { type: 'boolean', example: true },
                        totalLikes: { type: 'integer', example: 43 }
                    }
                },
                BlogSaveState: {
                    type: 'object',
                    properties: {
                        blogId: { type: 'string', example: '66a59ced88c5dcf13d81f030' },
                        isSaved: { type: 'boolean', example: true }
                    }
                },
                PlatformAdminLoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'platform-admin' },
                        password: { type: 'string', format: 'password', example: 'secure-admin-password' }
                    }
                }
            }
        },
        paths: {
            '/api/v1/blogs': {
                get: {
                    tags: ['Blog Engagement'],
                    summary: 'List published blogs (Public / Guest access with optional student like/save state)',
                    security: [{ bearerAuth: [] }, {}],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'search', in: 'query', schema: { type: 'string', maxLength: 150 } },
                        { name: 'author', in: 'query', schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } },
                        { name: 'category', in: 'query', schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } },
                        { name: 'tag', in: 'query', schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }
                    ],
                    responses: {
                        200: {
                            description: 'Published blogs returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/StudentBlogListData' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/blogs/saved': {
                get: {
                    tags: ['Blog Engagement'],
                    summary: 'List blogs saved by the logged-in student',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'search', in: 'query', schema: { type: 'string', maxLength: 150 } }
                    ],
                    responses: {
                        200: {
                            description: 'Saved blogs returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/StudentBlogListData' }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' }
                    }
                }
            },
            '/api/v1/blogs/{blogId}': {
                get: {
                    tags: ['Blog Engagement'],
                    summary: 'Get a published blog by ID or URL slug (Public / Guest access)',
                    security: [{ bearerAuth: [] }, {}],
                    parameters: [{
                        name: 'blogId',
                        in: 'path',
                        description: 'MongoDB ObjectId or URL slug string (e.g., neet-2026-preparation-guide)',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    responses: {
                        200: {
                            description: 'Blog returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/StudentBlogCard' }
                                        }
                                    }
                                }
                            }
                        },
                        404: { description: 'Published blog not found.' }
                    }
                }
            },
            '/api/v1/blogs/{blogId}/like': {
                post: {
                    tags: ['Blog Engagement'],
                    summary: 'Like a blog',
                    description: 'Idempotent: repeated requests do not create duplicate likes or increment the counter twice.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'blogId', in: 'path', required: true,
                        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
                    }],
                    responses: {
                        200: {
                            description: 'Blog liked.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/BlogLikeState' }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        404: { description: 'Published blog not found.' }
                    }
                },
                delete: {
                    tags: ['Blog Engagement'],
                    summary: 'Remove the student’s like from a blog',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'blogId', in: 'path', required: true,
                        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
                    }],
                    responses: {
                        200: {
                            description: 'Blog unliked.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/BlogLikeState' }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        404: { description: 'Published blog not found.' }
                    }
                }
            },
            '/api/v1/blogs/{blogId}/save': {
                post: {
                    tags: ['Blog Engagement'],
                    summary: 'Save a blog to the student’s private reading list',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'blogId', in: 'path', required: true,
                        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
                    }],
                    responses: {
                        200: {
                            description: 'Blog saved.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/BlogSaveState' }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        404: { description: 'Published blog not found.' }
                    }
                },
                delete: {
                    tags: ['Blog Engagement'],
                    summary: 'Remove a blog from the student’s saved list',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'blogId', in: 'path', required: true,
                        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
                    }],
                    responses: {
                        200: {
                            description: 'Blog removed from saved list.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/BlogSaveState' }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        404: { description: 'Published blog not found.' }
                    }
                }
            },
            '/api/v1/admin/blogs/{id}/featured-image': {
                post: {
                    tags: ['Blogs'],
                    summary: 'Upload an image from the admin device and attach it to a blog',
                    description: 'Uploads the selected image through the media library to Cloudinary and sets the blog featuredImage URL.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
                    }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: { type: 'string', format: 'binary' },
                                        altText: { type: 'string', maxLength: 500 },
                                        caption: { type: 'string', maxLength: 1000 },
                                        displayName: { type: 'string', maxLength: 250 },
                                        folder: { type: 'string', default: 'mbbs-cms/blogs' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Image uploaded and attached to the blog.' },
                        400: { description: 'Invalid blog ID, missing file, or unsupported image.' },
                        401: { description: 'Admin token is missing, invalid, or expired.' },
                        404: { description: 'Blog not found.' },
                        413: { description: 'Image exceeds the configured size limit.' }
                    }
                }
            },
            '/api/v1/authors': {
                get: {
                    tags: ['Author Following'],
                    summary: 'List active authors for the student UI',
                    description: 'Returns author cards with the logged-in student’s follow state and the current follower count.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
                        { name: 'featured', in: 'query', schema: { type: 'boolean' } }
                    ],
                    responses: {
                        200: {
                            description: 'Authors returned successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/AuthorListData' }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'Invalid query parameters.' },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' }
                    }
                }
            },
            '/api/v1/authors/following': {
                get: {
                    tags: ['Author Following'],
                    summary: 'List authors followed by the logged-in student',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } }
                    ],
                    responses: {
                        200: {
                            description: 'Followed authors returned successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/AuthorListData' }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' }
                    }
                }
            },
            '/api/v1/authors/{authorId}': {
                get: {
                    tags: ['Author Following'],
                    summary: 'Get one active author profile and follow state',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'authorId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
                    }],
                    responses: {
                        200: {
                            description: 'Author profile returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/StudentAuthorCard' }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'Invalid authorId.' },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        404: { description: 'Author not found or unavailable.' }
                    }
                }
            },
            '/api/v1/authors/{authorId}/follow': {
                post: {
                    tags: ['Author Following'],
                    summary: 'Follow an author',
                    description: 'Idempotent: following the same author more than once does not create duplicates.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'authorId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
                    }],
                    responses: {
                        200: {
                            description: 'Author is followed.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/AuthorFollowState' }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'Invalid authorId.' },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        404: { description: 'Author not found or unavailable.' }
                    }
                },
                delete: {
                    tags: ['Author Following'],
                    summary: 'Unfollow an author',
                    description: 'Idempotent: the result remains successful if the student already unfollowed the author.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'authorId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
                    }],
                    responses: {
                        200: {
                            description: 'Author is not followed.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string' },
                                            data: { $ref: '#/components/schemas/AuthorFollowState' }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'Invalid authorId.' },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        404: { description: 'Author not found or unavailable.' }
                    }
                }
            },
            '/api/v1/auth/sign-up': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Step 1: Start sign-up and send mobile OTP',
                    description: 'Validates and temporarily stores the registration details with a bcrypt password hash, rejects an email or mobile number already in neet-auth, and sends a five-minute OTP through Twilio. The account is not created until Step 2.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SignupRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'OTP generated and accepted by Twilio for delivery.' },
                        400: { description: 'Registration payload is invalid.' },
                        409: { description: 'Email or mobile number is already registered.' },
                        429: { description: 'OTP resend cooldown is active.' },
                        502: { description: 'Twilio could not send the OTP.' },
                        500: {
                            description: 'Validation or server error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/auth/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Log in with email and password',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    student_id: {
                                                        type: 'string',
                                                        description: 'Unique student identifier.',
                                                        example: 'STU1784270552819BG1KRS'
                                                    },
                                                    accessToken: {
                                                        type: 'string',
                                                        description: 'JWT access token. Send it as Authorization: Bearer <accessToken> for protected APIs.'
                                                    },
                                                    refreshToken: { type: 'string', description: 'JWT refresh token' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Email or password is missing',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        403: {
                            description: 'Invalid credentials',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        500: {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            // Google authentication is temporarily disabled in auth.routes.js.
            // Keep its Swagger definition commented for straightforward restore.
            // '/api/v1/auth/google': {
            //     post: {
            //         tags: ['Authentication'],
            //         summary: 'Create or log in a student with Google',
            //         description: 'Verifies a Google Firebase ID token and returns backend tokens.',
            //         requestBody: {
            //             required: true,
            //             content: {
            //                 'application/json': {
            //                     schema: { $ref: '#/components/schemas/GoogleLoginRequest' }
            //                 }
            //             }
            //         },
            //         responses: {
            //             200: { description: 'Existing student logged in successfully.' },
            //             201: { description: 'New student created and logged in successfully.' }
            //         }
            //     }
            // },
            '/api/v1/auth/refresh-token': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Rotate a refresh token and issue new tokens',
                    description: 'No Authorization header is required. The submitted refresh token must belong to an active stored auth session. Successful use rotates it, making the old refresh token invalid.',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } }
                    },
                    responses: {
                        200: { description: 'New accessToken and refreshToken returned.' },
                        400: { description: 'refreshToken is missing.' },
                        401: { description: 'Refresh token is invalid, expired, reused, or revoked.' }
                    }
                }
            },
            '/api/v1/auth/logout': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Log out the current device/session',
                    description: 'Requires the current access token. Revokes only the linked auth session, immediately invalidating that session’s access and refresh tokens.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Current session logged out successfully.' },
                        400: { description: 'Legacy access token is not linked to a session.' },
                        401: { description: 'Access token is invalid, expired, or revoked.' }
                    }
                }
            },
            '/api/v1/auth/logout-all': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Log out every device/session',
                    description: 'Requires an access token. Revokes every stored session and increments token_version, immediately invalidating all existing access and refresh tokens.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'All sessions logged out successfully.' },
                        401: { description: 'Access token is invalid, expired, or revoked.' },
                        404: { description: 'User account not found.' }
                    }
                }
            },
            '/api/v1/auth/sign-up/verify-otp': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Step 2: Verify sign-up OTP and create account',
                    description: 'Verifies the mobile OTP, creates the user in neet-auth, marks the OTP record as used, and returns an access token.',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupOtpVerifyRequest' } } }
                    },
                    responses: {
                        201: { description: 'Mobile verified, account created, and access token returned.' },
                        400: { description: 'OTP is malformed, invalid, or expired.' },
                        409: { description: 'Email or mobile number became registered before verification.' },
                        429: { description: 'Maximum OTP attempts reached.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/auth/forgot-password': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Step 1: Generate and send password-reset OTP',
                    description: 'The backend generates a cryptographically secure 6-digit OTP, stores only its HMAC hash in reset-password, and sends the OTP through Twilio. The OTP expires after 5 minutes.',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } }
                    },
                    responses: {
                        200: { description: 'OTP generated, hashed, stored, and accepted by Twilio for delivery.' },
                        400: { description: 'Phone number is invalid.' },
                        404: { description: 'No account uses the supplied phone number.' },
                        429: { description: 'OTP resend cooldown is active.' },
                        502: { description: 'Twilio could not send the SMS.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/auth/verify-reset-otp': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Step 2: Verify password-reset OTP',
                    description: 'Compares the submitted OTP hash using a timing-safe comparison. Successful verification returns a one-time reset token valid for 10 minutes.',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyResetOtpRequest' } } }
                    },
                    responses: {
                        200: { description: 'OTP verified and one-time reset token returned.' },
                        400: { description: 'OTP is malformed, invalid, or expired.' },
                        429: { description: 'Maximum OTP attempts reached.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/auth/reset-password': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Step 3: Set a new password',
                    description: 'Uses the one-time reset token to update the account. The Auth model hashes the new password with bcrypt, and token_version is increased so every previously issued access and refresh token becomes invalid.',
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } }
                    },
                    responses: {
                        200: { description: 'Password reset successfully.' },
                        400: { description: 'Payload or reset token is invalid or expired.' },
                        404: { description: 'User account no longer exists.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/auth/change-password': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Change the logged-in user password',
                    description: 'Requires a valid JWT and the current password. The new password is hashed with bcrypt, and all previously issued access and refresh tokens are invalidated.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } }
                    },
                    responses: {
                        200: { description: 'Password changed successfully.' },
                        400: { description: 'Password fields are missing, invalid, identical, or do not match.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        403: { description: 'Current password is incorrect.' },
                        404: { description: 'User account not found.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/test/leaderboard': {
                get: {
                    tags: ['Test Leaderboard'],
                    summary: 'Get the paginated test leaderboard',
                    description: 'Uses each active student’s best completed attempt. Ranking order is normalized score, correct answers, accuracy, lower time spent, then earlier submission.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'test_type', in: 'query', schema: { type: 'string', enum: ['Quick Test', 'Previous Year'] }, example: 'Previous Year' },
                        { name: 'previous_year_paper_id', in: 'query', description: 'Optional paper filter; valid only for Previous Year tests.', schema: { type: 'integer', minimum: 1 }, example: 15 },
                        { name: 'period', in: 'query', schema: { type: 'string', enum: ['ALL', 'DAILY', 'WEEKLY', 'MONTHLY'], default: 'ALL' } },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }
                    ],
                    responses: {
                        200: { description: 'Leaderboard entries and pagination returned.' },
                        400: { description: 'A filter or pagination value is invalid.' },
                        401: { description: 'Student access token is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/test/leaderboard/me': {
                get: {
                    tags: ['Test Leaderboard'],
                    summary: 'Get the logged-in student’s leaderboard rank',
                    description: 'Accepts the same test_type, previous_year_paper_id, and period filters as the main leaderboard.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'test_type', in: 'query', schema: { type: 'string', enum: ['Quick Test', 'Previous Year'] } },
                        { name: 'previous_year_paper_id', in: 'query', schema: { type: 'integer', minimum: 1 } },
                        { name: 'period', in: 'query', schema: { type: 'string', enum: ['ALL', 'DAILY', 'WEEKLY', 'MONTHLY'], default: 'ALL' } }
                    ],
                    responses: {
                        200: { description: 'The student’s best eligible attempt and rank returned.' },
                        400: { description: 'A filter value is invalid.' },
                        401: { description: 'Student access token is missing, invalid, expired, or revoked.' },
                        404: { description: 'The student has no eligible completed test for these filters.' }
                    }
                }
            },
            '/api/v1/test/history': {
                get: {
                    tags: ['Quick Test'],
                    summary: 'List the logged-in student test history',
                    description: 'Returns summary records for both Quick Test and Previous Year sessions without answer arrays or question IDs.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['Started', 'Completed', 'Expired'] } },
                        { name: 'test_type', in: 'query', schema: { type: 'string', enum: ['Quick Test', 'Previous Year'] } }
                    ],
                    responses: { 200: { description: 'Paginated test history returned.' }, 400: { description: 'A filter is invalid.' }, 401: { description: 'Student token is missing or invalid.' } }
                }
            },
            '/api/v1/test/sessions/{sessionId}': {
                get: {
                    tags: ['Quick Test'],
                    summary: 'Get one owned test session',
                    description: 'Returns session metadata and ordered questions without correct answers or explanations.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Safe session detail returned.' }, 400: { description: 'Invalid sessionId.' }, 401: { description: 'Student token is missing or invalid.' }, 404: { description: 'Owned session not found.' } }
                }
            },
            '/api/v1/test/sessions/{sessionId}/result': {
                get: {
                    tags: ['Quick Test'],
                    summary: 'Get a completed test result and answer review',
                    description: 'Returns scoring, timing, selected options, correct answers, and explanations only after the owned session is Completed.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Completed result and question review returned.' }, 400: { description: 'Invalid sessionId.' }, 401: { description: 'Student token is missing or invalid.' }, 404: { description: 'Owned session not found.' }, 409: { description: 'Session is not completed.' } }
                }
            },
            '/api/v1/test/subjects': {
                get: {
                    tags: ['Quick Test'],
                    summary: 'Step 1: Get available subjects',
                    description: 'Returns the distinct subjects stored in the topic collection.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Subjects returned successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            total: { type: 'integer', example: 4 },
                                            data: {
                                                type: 'array',
                                                items: { type: 'string' },
                                                example: ['Physics', 'Chemistry', 'Botany', 'Zoology']
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'JWT is missing, invalid, or expired.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        400: { description: 'Registration payload or one-time token is invalid.' },
                        409: { description: 'Email or mobile number is already registered.' },
                        500: {
                            description: 'Server or database error.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/TestErrorResponse' } } }
                        }
                    }
                }
            },
            '/api/v1/test/chapters': {
                post: {
                    tags: ['Quick Test'],
                    summary: 'Step 2: Get chapters for selected subjects',
                    description: 'Send one or more subjects. The API returns unique chapters belonging to them.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TestSelectionRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Chapters returned successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            total: { type: 'integer', example: 2 },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: { chapter: { type: 'string' } }
                                                },
                                                example: [
                                                    { chapter: 'Motion in a Straight Line' },
                                                    { chapter: 'Units and Measurements' }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'No subject was selected.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/TestErrorResponse' } } }
                        },
                        401: {
                            description: 'JWT is missing, invalid, or expired.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        500: {
                            description: 'Server or database error.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/TestErrorResponse' } } }
                        }
                    }
                }
            },
            '/api/v1/test/topics': {
                post: {
                    tags: ['Quick Test'],
                    summary: 'Step 3: Get topics for selected chapters',
                    description: 'Send the selected subjects and chapters to retrieve their topics.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TestTopicRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Topics returned successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            total: { type: 'integer', example: 1 },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'integer', example: 101 },
                                                        name: { type: 'string', example: 'Physical quantities' },
                                                        subject: { type: 'string', example: 'Physics' },
                                                        chapter: { type: 'string', example: 'Units and Measurements' },
                                                        icon: { type: 'string', example: '📚' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'JWT is missing, invalid, or expired.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        500: {
                            description: 'Invalid payload, server, or database error.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/TestErrorResponse' } } }
                        }
                    }
                }
            },
            '/api/v1/test/start': {
                post: {
                    tags: ['Quick Test'],
                    summary: 'Step 4: Start a quick test',
                    description: 'Finds topics for the selected chapters, randomly selects questions, hides correct answers and explanations, and creates a student test session.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StartQuickTestRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Test session created and questions returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            sessionId: { type: 'string', example: '6879c11b92eaed84fcf156c1' },
                                            duration: { type: 'integer', example: 15 },
                                            totalQuestions: { type: 'integer', example: 15 },
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/TestQuestion' }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'JWT is missing, invalid, or expired.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        500: {
                            description: 'Validation, session creation, server, or database error.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/TestErrorResponse' } } }
                        }
                    }
                }
            },
            '/api/v1/test/submit': {
                post: {
                    tags: ['Quick Test'],
                    summary: 'Step 5: Submit the completed test',
                    description: 'Checks each submitted option, awards +4 for a correct answer and -1 for a wrong answer, updates the session, and returns the result review.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SubmitTestRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Test submitted and result calculated.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            score: { type: 'integer', example: 11 },
                                            correct: { type: 'integer', example: 3 },
                                            wrong: { type: 'integer', example: 1 },
                                            accuracy: { type: 'number', format: 'float', example: 75 },
                                            review: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        question_id: { type: 'integer', example: 1001 },
                                                        selected: { type: 'string', example: 'B' },
                                                        correct_answer: { type: 'string', example: 'B' },
                                                        isCorrect: { type: 'boolean', example: true }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'sessionId or answers are missing, or the sessionId format is invalid.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/TestErrorResponse' } } }
                        },
                        401: {
                            description: 'JWT is missing, invalid, or expired.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        404: {
                            description: 'The student test session or a submitted question_id was not found.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/TestErrorResponse' },
                                    example: {
                                        success: false,
                                        message: 'Question with id 1001 was not found.'
                                    }
                                }
                            }
                        },
                        409: {
                            description: 'The test session has already been submitted.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/TestErrorResponse' } } }
                        },
                        500: {
                            description: 'Invalid answer data, session update, server, or database error.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/TestErrorResponse' } } }
                        }
                    }
                }
            },
            '/api/v1/chat-sessions': {
                get: {
                    tags: ['Test Review Chatbot'],
                    summary: 'List the logged-in student\'s chat sessions',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'active', in: 'query', schema: { type: 'boolean' } }
                    ],
                    responses: {
                        200: { description: 'Paginated chat sessions returned.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        500: { description: 'Server or database error.' }
                    }
                },
                post: {
                    tags: ['Test Review Chatbot'],
                    summary: 'Step 1: Create a chat for a completed test',
                    description: 'Verifies test ownership and stores the IDs of questions answered incorrectly.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateChatSessionRequest' } } }
                    },
                    responses: {
                        201: {
                            description: 'Chat session created.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ChatSession' } } }
                        },
                        400: { description: 'Invalid testSessionId or the test has no wrong answers.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'Completed test session not found for this student.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/chat-sessions/{chatSessionId}': {
                parameters: [{
                    name: 'chatSessionId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    example: '687b51de7277aa31465561fd'
                }],
                get: {
                    tags: ['Test Review Chatbot'],
                    summary: 'Get one owned chat session',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Chat session returned.' },
                        400: { description: 'Invalid chatSessionId.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'Chat session not found.' }
                    }
                },
                patch: {
                    tags: ['Test Review Chatbot'],
                    summary: 'Rename a chat session',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateChatSessionRequest' } } }
                    },
                    responses: {
                        200: { description: 'Chat title updated.' },
                        400: { description: 'Invalid ID or title.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'Chat session not found.' }
                    }
                },
                delete: {
                    tags: ['Test Review Chatbot'],
                    summary: 'Deactivate a chat session',
                    description: 'Soft-deletes the chat by setting is_active to false; messages are retained.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Chat session deactivated.' },
                        400: { description: 'Invalid chatSessionId.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'Active chat session not found.' }
                    }
                }
            },
            '/api/v1/chat-sessions/{chatSessionId}/messages': {
                parameters: [{
                    name: 'chatSessionId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    example: '687b51de7277aa31465561fd'
                }],
                get: {
                    tags: ['Test Review Chatbot'],
                    summary: 'Get paginated messages for an owned chat',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }
                    ],
                    responses: {
                        200: { description: 'Messages returned in chronological order.' },
                        400: { description: 'Invalid chatSessionId.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'Chat session not found.' }
                    }
                },
                post: {
                    tags: ['Test Review Chatbot'],
                    summary: 'Step 2: Ask Gemini about wrong answers',
                    description: 'Grounds Gemini with the completed test\'s wrong questions, selected options, correct answers, and explanations, then stores both messages.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/SendChatMessageRequest' } } }
                    },
                    responses: {
                        200: { description: 'User and Gemini messages stored and returned.' },
                        400: { description: 'Invalid ID or message.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'Active chat or linked test session not found.' },
                        502: { description: 'Gemini request failed, returned no text, or returned unrecoverable invalid JSON.' },
                        503: { description: 'Gemini is not configured or remains temporarily unavailable after retries and fallback.' }
                    }
                }
            },
            '/api/v1/chat-sessions/{chatSessionId}/insights': {
                post: {
                    tags: ['Test Review Chatbot'],
                    summary: 'Step 2: Generate insights for all wrong answers',
                    description: 'No request body is required. The backend calculates factual performance values, asks Gemini for qualitative wrong-answer analysis, and upserts the combined report into test-subject-zone-insights.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'chatSessionId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        example: '687b51de7277aa31465561fd'
                    }],
                    responses: {
                        200: { description: 'Insights generated for all wrong answers and stored in chat history.' },
                        400: { description: 'Invalid chatSessionId.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'Active chat or linked test session not found.' },
                        502: { description: 'Gemini request failed or returned no text.' },
                        503: { description: 'Gemini is not configured or remains temporarily unavailable after retries and fallback.' }
                    }
                }
            },
            '/api/v1/test-subject-zone-insights/{testSessionId}': {
                get: {
                    tags: ['Test Review Chatbot'],
                    summary: 'Step 3: Get the stored test subject zone insight',
                    description: 'Returns the structured insight stored in test-subject-zone-insights for the logged-in student and supplied test session.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'testSessionId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        example: '6a59c9163133406e11373f53'
                    }],
                    responses: {
                        200: { description: 'Stored subject zone insight returned successfully.' },
                        400: { description: 'Invalid testSessionId.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'No insight exists for this student and test session.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/user-activity': {
                post: {
                    tags: ['User Activity'],
                    summary: 'Create or update user activity',
                    description: 'Send only the numeric user_id. The server records last_seen, IP address, and user agent automatically.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserActivityRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Existing user activity updated successfully.' },
                        201: { description: 'User activity created successfully.' },
                        400: { description: 'user_id is missing or invalid.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/user-activity/{userId}': {
                get: {
                    tags: ['User Activity'],
                    summary: 'Get activity for a numeric user ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'userId',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer', minimum: 1 },
                        example: 3
                    }],
                    responses: {
                        200: { description: 'User activity returned successfully.' },
                        400: { description: 'userId is invalid.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'User activity not found.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/test/question-feedback': {
                post: {
                    tags: ['Question Feedback'],
                    summary: 'Submit feedback for a test question',
                    description: 'The server gets student_id from the JWT and verifies that the test session belongs to the student and contains the supplied question. Submitting again updates the existing feedback.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/QuestionFeedbackRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Existing feedback updated successfully.' },
                        201: { description: 'Question feedback submitted successfully.' },
                        400: { description: 'Feedback payload is invalid.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        404: { description: 'Question or matching student test session not found.' },
                        500: { description: 'Server or database error.' }
                    }
                },
                get: {
                    tags: ['Question Feedback'],
                    summary: 'List the logged-in student\'s question feedback',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'question_id', in: 'query', schema: { type: 'integer' } }
                    ],
                    responses: {
                        200: { description: 'Feedback list returned successfully.' },
                        400: { description: 'question_id filter is invalid.' },
                        401: { description: 'JWT is missing, invalid, or expired.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/review-comments': {
                post: {
                    tags: ['Review Comments'],
                    summary: 'Submit a review comment',
                    description: 'user_id and student_id come from the JWT. test_session_id is optional, but when supplied it must belong to the logged-in student.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ReviewCommentRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Review comment stored successfully.' },
                        400: { description: 'Review payload is invalid.' },
                        401: { description: 'JWT is missing, invalid, expired, or revoked.' },
                        404: { description: 'Optional test session does not belong to the student.' },
                        500: { description: 'Server or database error.' }
                    }
                },
                get: {
                    tags: ['Review Comments'],
                    summary: 'List the logged-in student\'s review comments',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        {
                            name: 'review_type',
                            in: 'query',
                            schema: { type: 'string', enum: ['app', 'test', 'chatbot', 'question', 'other'] }
                        }
                    ],
                    responses: {
                        200: { description: 'Review comments returned successfully.' },
                        400: { description: 'review_type filter is invalid.' },
                        401: { description: 'JWT is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/notifications': {
                post: {
                    tags: ['Notifications'],
                    summary: 'Create a notification for the logged-in student',
                    description: 'user_id and student_id are always taken from the JWT. Internal controllers can also use createNotificationService.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationRequest' } } }
                    },
                    responses: {
                        201: { description: 'Notification created successfully.' },
                        400: { description: 'Notification payload is invalid.' },
                        401: { description: 'JWT is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                },
                get: {
                    tags: ['Notifications'],
                    summary: 'List the logged-in student notifications',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'is_read', in: 'query', schema: { type: 'boolean' } },
                        {
                            name: 'notification_type',
                            in: 'query',
                            schema: { type: 'string', enum: ['system', 'test', 'qod', 'chatbot', 'account', 'reminder'] }
                        }
                    ],
                    responses: {
                        200: { description: 'Notification list returned successfully.' },
                        400: { description: 'A query filter is invalid.' },
                        401: { description: 'JWT is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/notifications/unread-count': {
                get: {
                    tags: ['Notifications'],
                    summary: 'Get the unread notification count',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Unread count returned successfully.' },
                        401: { description: 'JWT is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/notifications/read-all': {
                patch: {
                    tags: ['Notifications'],
                    summary: 'Mark all notifications as read',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'All unread notifications marked as read.' },
                        401: { description: 'JWT is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/notifications/{notificationId}/read': {
                patch: {
                    tags: ['Notifications'],
                    summary: 'Mark one notification as read',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'notificationId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    responses: {
                        200: { description: 'Notification marked as read.' },
                        400: { description: 'notificationId is invalid.' },
                        401: { description: 'JWT is missing, invalid, expired, or revoked.' },
                        404: { description: 'Notification not found for this user.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/notifications/{notificationId}': {
                delete: {
                    tags: ['Notifications'],
                    summary: 'Dismiss one notification',
                    description: 'Soft-deletes the notification so it remains in MongoDB but no longer appears in the student list.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{
                        name: 'notificationId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }],
                    responses: {
                        200: { description: 'Notification dismissed successfully.' },
                        400: { description: 'notificationId is invalid.' },
                        401: { description: 'JWT is missing, invalid, expired, or revoked.' },
                        404: { description: 'Notification not found for this user.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/admin/login': {
                post: {
                    tags: ['Platform Admin'],
                    summary: 'Log in as an active platform administrator',
                    description: 'Verifies the submitted password against the bcrypt password_hash in platform-admins and returns an admin JWT.',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PlatformAdminLoginRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Admin login successful and JWT returned.' },
                        400: { description: 'username or password is missing.' },
                        401: { description: 'Credentials are invalid or the admin is inactive.' },
                        500: { description: 'Server or database error.' },
                        503: { description: 'Neither ADMIN_SECRET_KEY nor SECRET_KEY is configured on the backend.' }
                    }
                }
            },
            '/api/v1/admin/dashboard': {
                get: {
                    tags: ['Platform Admin'], summary: 'Get admin dashboard totals',
                    security: [{ adminBearerAuth: [] }],
                    responses: { 200: { description: 'Platform totals returned.' }, 401: { description: 'Invalid admin token.' }, 500: { description: 'Server error.' } }
                }
            },
            '/api/v1/admin/students': {
                get: {
                    tags: ['Platform Admin'], summary: 'List and search students', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: { 200: { description: 'Students returned without password data.' }, 401: { description: 'Invalid admin token.' } }
                }
            },
            '/api/v1/admin/user-login-activity': {
                get: {
                    tags: ['Platform Admin'],
                    summary: 'List user login activity',
                    description: 'Returns append-only successful password-login events from neet-app-user-activity. Passwords, password hashes, access tokens, and refresh tokens are never stored or returned.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'search', in: 'query', description: 'Search email, student ID, name, IP address, or user agent.', schema: { type: 'string' } },
                        { name: 'user_id', in: 'query', schema: { type: 'string' } },
                        { name: 'student_id', in: 'query', schema: { type: 'string' } },
                        { name: 'email', in: 'query', schema: { type: 'string', format: 'email' } },
                        { name: 'ip_address', in: 'query', schema: { type: 'string' } },
                        { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date-time' } },
                        { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date-time' } }
                    ],
                    responses: {
                        200: {
                            description: 'Paginated login activity returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            page: { type: 'integer', example: 1 },
                                            limit: { type: 'integer', example: 20 },
                                            total: { type: 'integer', example: 42 },
                                            totalPages: { type: 'integer', example: 3 },
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/UserLoginActivity' }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'A filter or date is invalid.' },
                        401: { description: 'Admin token is missing, invalid, or expired.' },
                        503: { description: 'Admin authentication secrets are unavailable.' }
                    }
                }
            },
            '/api/v1/admin/students/{studentId}': {
                patch: {
                    tags: ['Platform Admin'], summary: 'Adjust student account and subscription settings', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        required: true, content: {
                            'application/json': {
                                schema: {
                                    type: 'object', properties: {
                                        is_active: { type: 'boolean' }, is_verified: { type: 'boolean' }, email_verified: { type: 'boolean' },
                                        is_institution_student: { type: 'boolean' }, subscription_plan: { type: 'string' },
                                        subscription_expires_at: { type: 'string', format: 'date-time' }, target_exam_year: { type: 'integer' },
                                        batch: { type: 'string', example: 'NEET-2027-A' }, course: { type: 'string', example: 'NEET UG' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 200: { description: 'Student settings updated.' }, 400: { description: 'Invalid settings.' }, 404: { description: 'Student not found.' } }
                }
            },
            '/api/v1/admin/questions': {
                get: { tags: ['Platform Admin'], summary: 'List questions', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'is_active', in: 'query', schema: { type: 'boolean' } }], responses: { 200: { description: 'Questions returned.' } } },
                post: { tags: ['Platform Admin'], summary: 'Create a question', security: [{ adminBearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Question created.' }, 400: { description: 'Invalid question.' } } }
            },
            '/api/v1/admin/questions/{id}': {
                patch: { tags: ['Platform Admin'], summary: 'Update a question', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Question updated.' }, 404: { description: 'Question not found.' } } }
            },
            '/api/v1/admin/questions/{id}/status': {
                patch: { tags: ['Platform Admin'], summary: 'Activate or deactivate a question', description: 'Soft-deactivation keeps the record but excludes it from newly generated tests.', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['is_active'], properties: { is_active: { type: 'boolean', example: false } } } } } }, responses: { 200: { description: 'Question status updated.' }, 400: { description: 'Invalid ID or status.' }, 404: { description: 'Question not found.' } } }
            },
            '/api/v1/admin/topics': {
                get: { tags: ['Platform Admin'], summary: 'List topics', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'is_active', in: 'query', schema: { type: 'boolean' } }], responses: { 200: { description: 'Topics returned.' } } },
                post: { tags: ['Platform Admin'], summary: 'Create a topic', security: [{ adminBearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Topic created.' } } }
            },
            '/api/v1/admin/topics/{id}': {
                patch: { tags: ['Platform Admin'], summary: 'Update a topic', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Topic updated.' }, 404: { description: 'Topic not found.' } } }
            },
            '/api/v1/admin/topics/{id}/status': {
                patch: { tags: ['Platform Admin'], summary: 'Activate or deactivate a topic', description: 'Soft-deactivation keeps the topic but excludes it from new test selection.', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['is_active'], properties: { is_active: { type: 'boolean', example: false } } } } } }, responses: { 200: { description: 'Topic status updated.' }, 400: { description: 'Invalid ID or status.' }, 404: { description: 'Topic not found.' } } }
            },
            '/api/v1/admin/qod': {
                get: { tags: ['Platform Admin'], summary: 'List Questions of the Day', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'is_active', in: 'query', schema: { type: 'boolean' } }], responses: { 200: { description: 'QOD records returned.' } } },
                post: { tags: ['Platform Admin'], summary: 'Create a Question of the Day', security: [{ adminBearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'QOD created.' } } }
            },
            '/api/v1/admin/qod/{id}': {
                patch: { tags: ['Platform Admin'], summary: 'Update a Question of the Day', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'QOD updated.' }, 404: { description: 'QOD not found.' } } }
            },
            '/api/v1/admin/qod/{id}/status': {
                patch: { tags: ['Platform Admin'], summary: 'Activate or deactivate a Question of the Day', description: 'A deactivated QOD is not returned to students and does not accept a new submission.', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['is_active'], properties: { is_active: { type: 'boolean', example: false } } } } } }, responses: { 200: { description: 'QOD status updated.' }, 400: { description: 'Invalid ID or status.' }, 404: { description: 'QOD not found.' } } }
            },
            '/api/v1/admin/moderation/{resource}': {
                get: { tags: ['Platform Admin'], summary: 'List question feedback or review comments', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['question-feedback', 'review-comments'] } }, { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'reviewed', 'resolved', 'rejected'] } }], responses: { 200: { description: 'Moderation items returned.' } } }
            },
            '/api/v1/admin/moderation/{resource}/{itemId}': {
                patch: { tags: ['Platform Admin'], summary: 'Update moderation status', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['question-feedback', 'review-comments'] } }, { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['pending', 'reviewed', 'resolved', 'rejected'] } } } } } }, responses: { 200: { description: 'Moderation status updated.' }, 404: { description: 'Item not found.' } } }
            },
            '/api/v1/admin/notifications': {
                post: { tags: ['Platform Admin'], summary: 'Send a notification to one student', security: [{ adminBearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['student_id', 'title', 'message'], properties: { student_id: { type: 'string' }, title: { type: 'string' }, message: { type: 'string' }, notification_type: { type: 'string' }, priority: { type: 'string' }, action_url: { type: 'string' }, data: { type: 'object' } } } } } }, responses: { 201: { description: 'Notification created.' }, 404: { description: 'Student not found.' } } }
            },
            '/api/v1/admin/notifications/broadcast': {
                post: {
                    tags: ['Platform Admin'],
                    summary: 'Broadcast a notification to a student audience',
                    description: 'Creates one notification per matched student. BATCH and COURSE use student-profile fields; YEAR uses target_exam_year.',
                    security: [{ adminBearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['audience', 'title', 'message'],
                                    properties: {
                                        audience: { type: 'string', enum: ['ALL_STUDENTS', 'ACTIVE_STUDENTS', 'SELECTED_STUDENTS', 'BATCH', 'COURSE', 'YEAR'], example: 'ALL_STUDENTS' },
                                        student_ids: { type: 'array', maxItems: 1000, items: { type: 'string' }, example: [] },
                                        batch: { type: 'string', example: 'NEET-2027-A' },
                                        course: { type: 'string', example: 'NEET UG' },
                                        year: { type: 'integer', minimum: 2000, maximum: 2200, example: 2027 },
                                        title: { type: 'string', maxLength: 150, example: 'Platform announcement' },
                                        message: { type: 'string', maxLength: 1000, example: 'A new test is available.' },
                                        notification_type: { type: 'string', enum: ['GENERAL', 'SYSTEM', 'TEST', 'QOD', 'CHATBOT', 'ACCOUNT', 'REMINDER'], default: 'GENERAL' },
                                        priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL' },
                                        action_url: { type: 'string', maxLength: 500, nullable: true, example: '/tests' },
                                        data: { type: 'object', nullable: true }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Notifications created for all matched recipients.' },
                        400: { description: 'Audience, selector, content, type, or priority is invalid.' },
                        401: { description: 'Admin access token is missing or invalid.' },
                        500: { description: 'Database error while creating the broadcast.' }
                    }
                }
            },
            '/api/v1/admin/admins': {
                get: { tags: ['Platform Admin'], summary: 'List platform admins', security: [{ adminBearerAuth: [] }], responses: { 200: { description: 'Admins returned without password hashes.' } } },
                post: { tags: ['Platform Admin'], summary: 'Create a platform admin', security: [{ adminBearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['username', 'password'], properties: { id: { type: 'integer' }, username: { type: 'string' }, password: { type: 'string', format: 'password', minLength: 8 }, is_active: { type: 'boolean', default: true } } } } } }, responses: { 201: { description: 'Admin created with a bcrypt password hash.' }, 409: { description: 'Admin ID or username already exists.' } } }
            },
            '/api/v1/admin/admins/{adminId}': {
                patch: { tags: ['Platform Admin'], summary: 'Update an admin username or active status', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'adminId', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, is_active: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Admin updated.' }, 404: { description: 'Admin not found.' }, 409: { description: 'Username already exists.' } } }
            },
            '/api/v1/admin/admins/{adminId}/reset-password': {
                post: { tags: ['Platform Admin'], summary: 'Reset an admin password', description: 'Hashes the new password and revokes all existing tokens for the target admin.', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'adminId', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['password', 'confirmPassword'], properties: { password: { type: 'string', format: 'password', minLength: 8 }, confirmPassword: { type: 'string', format: 'password', minLength: 8 } } } } } }, responses: { 200: { description: 'Password reset and tokens revoked.' }, 400: { description: 'Passwords are invalid or do not match.' }, 404: { description: 'Admin not found.' } } }
            },
            '/api/v1/admin/admins/{adminId}/status': {
                patch: { tags: ['Platform Admin'], summary: 'Activate or deactivate another admin', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'adminId', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['is_active'], properties: { is_active: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Admin status updated and existing tokens revoked.' }, 400: { description: 'Cannot deactivate own account.' }, 404: { description: 'Admin not found.' } } }
            },
            '/api/v1/admin/ai/seo': {
                post: {
                    tags: ['Blog AI'], summary: 'Generate a complete SEO suggestion', security: [{ adminBearerAuth: [] }],
                    description: 'Returns suggested metadata, social metadata, sitemap settings, slug, and schema type. It does not automatically save or overwrite Blog SEO.',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AIContentRequest' } } } },
                    responses: { 200: { description: 'SEO suggestion generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid content.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/faq': {
                post: {
                    tags: ['Blog AI'], summary: 'Generate FAQs from blog content', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/AIContentRequest' }, { type: 'object', properties: { count: { type: 'integer', minimum: 1, maximum: 20, default: 5 } } }] } } } },
                    responses: { 200: { description: 'FAQ suggestions generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid content or count.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/schema': {
                post: {
                    tags: ['Blog AI'], summary: 'Generate schema.org JSON-LD', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/AIContentRequest' }, { type: 'object', required: ['pageUrl'], properties: { pageUrl: { type: 'string', format: 'uri', example: 'https://mbbs-abroad.com/blogs/neet-2027-guide' }, schemaType: { type: 'string', enum: ['Article', 'BlogPosting', 'FAQPage', 'WebPage'], default: 'Article' } } }] } } } },
                    responses: { 200: { description: 'JSON-LD generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid content, URL, or schema type.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/keywords': {
                post: {
                    tags: ['Blog AI'], summary: 'Extract SEO keywords and entities', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/AIContentRequest' }, { type: 'object', properties: { count: { type: 'integer', minimum: 1, maximum: 50, default: 15 } } }] } } } },
                    responses: { 200: { description: 'Keywords generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid request.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/slug': {
                post: {
                    tags: ['Blog AI'], summary: 'Generate an SEO-friendly slug', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title'], properties: { title: { type: 'string', minLength: 2, maxLength: 250, example: 'NEET 2027 Preparation Guide' } } } } } },
                    responses: { 200: { description: 'Slug generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid title.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/meta': {
                post: {
                    tags: ['Blog AI'], summary: 'Generate meta title and description', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AIContentRequest' } } } },
                    responses: { 200: { description: 'Meta title and description generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid content.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/image-alt': {
                post: {
                    tags: ['Blog AI'], summary: 'Generate accessible image ALT text', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['imageUrl', 'title'], properties: { imageUrl: { type: 'string', format: 'uri' }, title: { type: 'string', maxLength: 250 }, context: { type: 'string', maxLength: 1000 } } } } } },
                    responses: { 200: { description: 'ALT text generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid image URL or context.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/internal-links': {
                post: {
                    tags: ['Blog AI'], summary: 'Suggest verified internal blog links', security: [{ adminBearerAuth: [] }],
                    description: 'Gemini can select only from real published public Blog records returned by the repository.',
                    requestBody: { required: true, content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/AIContentRequest' }, { type: 'object', properties: { blogId: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }, count: { type: 'integer', minimum: 1, maximum: 20, default: 5 } } }] } } } },
                    responses: { 200: { description: 'Verified internal links generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid request.' }, 401: { description: 'Invalid admin token.' }, 404: { description: 'No published link candidates.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/readability': {
                post: {
                    tags: ['Blog AI'], summary: 'Analyze content readability', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AIContentRequest' } } } },
                    responses: { 200: { description: 'Readability analysis generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid content.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/summary': {
                post: {
                    tags: ['Blog AI'], summary: 'Generate a blog summary and key points', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/AIContentRequest' }, { type: 'object', properties: { maxWords: { type: 'integer', minimum: 20, maximum: 500, default: 120 } } }] } } } },
                    responses: { 200: { description: 'Summary generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid request.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/translation': {
                post: {
                    tags: ['Blog AI'], summary: 'Translate blog content', description: 'Prepared for future multilingual publishing. The output is a suggestion and is not saved automatically.', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['content', 'targetLanguage'], properties: { content: { type: 'string', minLength: 20, maxLength: 50000 }, sourceLanguage: { type: 'string', default: 'English', example: 'English' }, targetLanguage: { type: 'string', example: 'Tamil' } } } } } },
                    responses: { 200: { description: 'Translation generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid content or language.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/ai/content-score': {
                post: {
                    tags: ['Blog AI'], summary: 'Generate an editorial and SEO content score', security: [{ adminBearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AIContentRequest' } } } },
                    responses: { 200: { description: 'Content scores and recommendations generated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AIResponse' } } } }, 400: { description: 'Invalid content.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'AI rate limit exceeded.' }, 503: { description: 'Gemini unavailable.' } }
                }
            },
            '/api/v1/admin/blog-analytics/dashboard': {
                get: {
                    tags: ['Blog Analytics'], summary: 'Get the live analytics dashboard', security: [{ adminBearerAuth: [] }],
                    description: 'Calculates current totals directly from blog collections and current-month growth compared with the previous month.',
                    responses: { 200: { description: 'Live dashboard returned.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'Rate limit exceeded.' } }
                }
            },
            '/api/v1/admin/blog-analytics/snapshots': {
                get: {
                    tags: ['Blog Analytics'], summary: 'List saved analytics snapshots', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'period', in: 'query', schema: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] } },
                        { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } }
                    ],
                    responses: { 200: { description: 'Snapshots and pagination returned.' }, 400: { description: 'Invalid filters.' }, 401: { description: 'Invalid admin token.' } }
                },
                post: {
                    tags: ['Blog Analytics'], summary: 'Generate or refresh an analytics snapshot', security: [{ adminBearerAuth: [] }],
                    description: 'Normalizes the date to the selected period and upserts one snapshot for that period/date.',
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['period'], properties: { period: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] }, date: { type: 'string', format: 'date', description: 'Defaults to today.' } } } } } },
                    responses: { 201: { description: 'Snapshot generated or refreshed.' }, 400: { description: 'Invalid period or date.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'Rate limit exceeded.' } }
                }
            },
            '/api/v1/admin/blog-analytics/snapshots/latest/{period}': {
                get: {
                    tags: ['Blog Analytics'], summary: 'Get the latest snapshot for one period', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'period', in: 'path', required: true, schema: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] } }],
                    responses: { 200: { description: 'Latest snapshot returned.' }, 400: { description: 'Invalid period.' }, 404: { description: 'No snapshot exists for this period.' } }
                }
            },
            '/api/v1/admin/blog-analytics/content-performance': {
                get: {
                    tags: ['Blog Analytics'], summary: 'Get top-performing blogs, authors, and categories', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } }],
                    responses: { 200: { description: 'Content performance returned.' }, 401: { description: 'Invalid admin token.' } }
                }
            },
            '/api/v1/blog-search': {
                get: {
                    tags: ['Blog Search'], summary: 'Search all supported blog modules', security: [],
                    description: 'Searches only published/active/approved frontend-safe records and ranks exact and partial matches.',
                    parameters: [
                        { name: 'keyword', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 100 }, example: 'biology' },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['relevance', 'createdAt', 'updatedAt', 'title', 'name', 'rating', 'popularity'], default: 'relevance' } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
                    ],
                    responses: { 200: { description: 'Ranked and grouped results returned.' }, 400: { description: 'Invalid keyword or query.' }, 429: { description: 'Rate limit exceeded.' } }
                }
            },
            '/api/v1/blog-search/module': {
                get: {
                    tags: ['Blog Search'], summary: 'Search one blog module', security: [],
                    parameters: [
                        { name: 'module', in: 'query', required: true, schema: { type: 'string', enum: ['BLOG', 'CATEGORY', 'TAG', 'AUTHOR', 'REVIEW', 'SEO', 'MEDIA'] } },
                        { name: 'keyword', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 100 } },
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 100, default: 10 } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['relevance', 'createdAt', 'updatedAt', 'title', 'name', 'rating', 'popularity'] } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
                    ],
                    responses: { 200: { description: 'Module search results returned.' }, 400: { description: 'Invalid or unavailable module.' } }
                }
            },
            '/api/v1/blog-search/suggestions': {
                get: {
                    tags: ['Blog Search'], summary: 'Get search suggestions', security: [],
                    description: 'Returns unique suggestions from published blogs and active categories, tags, and authors.',
                    parameters: [
                        { name: 'keyword', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: 50 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 10, default: 5 } }
                    ],
                    responses: { 200: { description: 'Suggestions returned.' }, 400: { description: 'Invalid query.' } }
                }
            },
            '/api/v1/blog-search/advanced': {
                post: {
                    tags: ['Blog Search'], summary: 'Run an advanced filtered search', security: [],
                    description: 'Category, author, and tag filters apply to BLOG. Rating applies to REVIEW.',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogAdvancedSearchInput' } } } },
                    responses: { 200: { description: 'Filtered ranked results returned.' }, 400: { description: 'Invalid search payload.' }, 429: { description: 'Rate limit exceeded.' } }
                }
            },
            '/api/v1/blog-reviews': {
                post: {
                    tags: ['Blog Reviews'], summary: 'Submit a student review', security: [{ bearerAuth: [] }],
                    description: 'Creates a PENDING review. A student can submit one active review for each reviewType/referenceId pair.',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogReviewInput' } } } },
                    responses: { 201: { description: 'Review submitted for moderation.' }, 400: { description: 'Invalid review or reference.' }, 401: { description: 'Student JWT required.' }, 409: { description: 'Student already reviewed this target.' } }
                }
            },
            '/api/v1/blog-reviews/mine': {
                get: { tags: ['Blog Reviews'], summary: 'List the authenticated student’s reviews', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Student reviews returned.' }, 401: { description: 'Student JWT required.' } } }
            },
            '/api/v1/blog-reviews/featured': {
                get: { tags: ['Blog Reviews'], summary: 'List approved featured reviews', security: [], responses: { 200: { description: 'Featured reviews returned.' } } }
            },
            '/api/v1/blog-reviews/reference/{reviewType}/{referenceId}': {
                get: {
                    tags: ['Blog Reviews'], summary: 'List approved reviews for one target', security: [],
                    parameters: [
                        { name: 'reviewType', in: 'path', required: true, schema: { type: 'string', enum: ['UNIVERSITY', 'COUNTRY', 'BLOG', 'CONSULTANT', 'AUTHOR', 'WEBSITE'] } },
                        { name: 'referenceId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: { 200: { description: 'Approved reviews returned.' }, 400: { description: 'Invalid type or ID.' } }
                }
            },
            '/api/v1/blog-reviews/{id}': {
                patch: {
                    tags: ['Blog Reviews'], summary: 'Update the authenticated student’s pending review', security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogReviewUpdateInput' } } } },
                    responses: { 200: { description: 'Review updated and returned to PENDING.' }, 403: { description: 'Review belongs to another student.' }, 404: { description: 'Review not found.' }, 409: { description: 'Approved review cannot be edited.' } }
                }
            },
            '/api/v1/admin/blog-reviews': {
                get: {
                    tags: ['Blog Reviews'], summary: 'List and filter reviews for moderation', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 100, default: 10 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'reviewType', in: 'query', schema: { type: 'string' } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'SPAM'] } },
                        { name: 'rating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 } },
                        { name: 'isFeatured', in: 'query', schema: { type: 'boolean' } },
                        { name: 'isVerified', in: 'query', schema: { type: 'boolean' } }
                    ],
                    responses: { 200: { description: 'Reviews and pagination returned.' }, 401: { description: 'Invalid admin token.' } }
                }
            },
            '/api/v1/admin/blog-reviews/statistics': {
                get: { tags: ['Blog Reviews'], summary: 'Get moderation and rating statistics', security: [{ adminBearerAuth: [] }], responses: { 200: { description: 'Review statistics returned.' } } }
            },
            '/api/v1/admin/blog-reviews/{id}': {
                get: { tags: ['Blog Reviews'], summary: 'Get one review for moderation', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Review returned.' }, 404: { description: 'Review not found.' } } },
                delete: { tags: ['Blog Reviews'], summary: 'Soft-delete a review', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Review soft-deleted.' }, 404: { description: 'Review not found.' } } }
            },
            '/api/v1/admin/blog-reviews/{id}/approve': {
                post: { tags: ['Blog Reviews'], summary: 'Approve a pending review', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Review approved.' }, 404: { description: 'Review not found.' } } }
            },
            '/api/v1/admin/blog-reviews/{id}/reject': {
                post: {
                    tags: ['Blog Reviews'], summary: 'Reject a review with a reason', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['rejectionReason'], properties: { rejectionReason: { type: 'string', minLength: 5, maxLength: 500 } } } } } },
                    responses: { 200: { description: 'Review rejected.' }, 400: { description: 'Reason is invalid.' }, 404: { description: 'Review not found.' } }
                }
            },
            '/api/v1/admin/blog-reviews/{id}/featured': {
                patch: { tags: ['Blog Reviews'], summary: 'Feature or unfeature an approved review', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['isFeatured'], properties: { isFeatured: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Featured status updated.' }, 409: { description: 'Only approved reviews can be featured.' } } }
            },
            '/api/v1/admin/blog-reviews/{id}/verified': {
                patch: { tags: ['Blog Reviews'], summary: 'Set review verification status', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['isVerified'], properties: { isVerified: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Verification status updated.' } } }
            },
            '/api/v1/admin/blog-reviews/{id}/restore': {
                patch: { tags: ['Blog Reviews'], summary: 'Restore a soft-deleted review as PENDING', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Review restored.' }, 409: { description: 'Review is not deleted or duplicates another review.' } } }
            },
            '/api/v1/admin/blog-seo': {
                get: {
                    tags: ['Blog SEO'], summary: 'List and search SEO records', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'module', in: 'query', schema: { type: 'string', enum: ['BLOG', 'PAGE', 'AUTHOR', 'CATEGORY', 'TAG', 'COUNTRY', 'UNIVERSITY', 'HOME', 'SERVICE'] } },
                        { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
                        { name: 'robots', in: 'query', schema: { type: 'string' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'metaTitle', 'slug'], default: 'createdAt' } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
                    ],
                    responses: { 200: { description: 'SEO records and pagination returned.' }, 400: { description: 'Invalid query.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'Rate limit exceeded.' } }
                },
                post: {
                    tags: ['Blog SEO'], summary: 'Create an SEO record', security: [{ adminBearerAuth: [] }],
                    description: 'Allows one record per module/reference pair and one record per slug. BLOG, AUTHOR, CATEGORY, and TAG references are verified.',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogSeoInput' } } } },
                    responses: { 201: { description: 'SEO record created in blog.blog-seo.' }, 400: { description: 'Invalid fields or reference.' }, 401: { description: 'Invalid admin token.' }, 409: { description: 'Slug or module/reference already exists.' } }
                }
            },
            '/api/v1/admin/blog-seo/statistics': {
                get: { tags: ['Blog SEO'], summary: 'Get SEO totals grouped by module', security: [{ adminBearerAuth: [] }], responses: { 200: { description: 'SEO statistics returned.' }, 401: { description: 'Invalid admin token.' } } }
            },
            '/api/v1/admin/blog-seo/module/{module}/{referenceId}': {
                get: {
                    tags: ['Blog SEO'], summary: 'Get SEO by module and reference ID', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'module', in: 'path', required: true, schema: { type: 'string', enum: ['BLOG', 'PAGE', 'AUTHOR', 'CATEGORY', 'TAG', 'COUNTRY', 'UNIVERSITY', 'HOME', 'SERVICE'] } },
                        { name: 'referenceId', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }
                    ],
                    responses: { 200: { description: 'SEO record returned.' }, 400: { description: 'Invalid module or reference ID.' }, 404: { description: 'SEO record not found.' } }
                }
            },
            '/api/v1/admin/blog-seo/{id}': {
                get: {
                    tags: ['Blog SEO'], summary: 'Get SEO by ID', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'SEO record returned.' }, 404: { description: 'SEO record not found.' } }
                },
                patch: {
                    tags: ['Blog SEO'], summary: 'Update SEO fields', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogSeoUpdateInput' } } } },
                    responses: { 200: { description: 'SEO updated.' }, 400: { description: 'Invalid update.' }, 404: { description: 'SEO record not found.' }, 409: { description: 'Slug or module/reference conflict.' } }
                },
                delete: {
                    tags: ['Blog SEO'], summary: 'Soft-delete an SEO record', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'SEO soft-deleted.' }, 404: { description: 'SEO record not found.' } }
                }
            },
            '/api/v1/admin/blog-seo/{id}/restore': {
                patch: {
                    tags: ['Blog SEO'], summary: 'Restore a soft-deleted SEO record', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'SEO restored.' }, 404: { description: 'SEO record not found.' }, 409: { description: 'Record is not deleted or now conflicts.' } }
                }
            },
            '/api/v1/admin/blog-media': {
                get: {
                    tags: ['Blog Media'], summary: 'List and search media', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'resourceType', in: 'query', schema: { type: 'string', enum: ['image', 'video', 'raw'] } },
                        { name: 'folder', in: 'query', schema: { type: 'string' } },
                        { name: 'tag', in: 'query', schema: { type: 'string' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'originalName', 'bytes'], default: 'createdAt' } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
                    ],
                    responses: { 200: { description: 'Media and pagination returned.' }, 400: { description: 'Invalid query.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'Rate limit exceeded.' } }
                }
            },
            '/api/v1/admin/blog-media/upload': {
                post: {
                    tags: ['Blog Media'], summary: 'Upload one file to Cloudinary', security: [{ adminBearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object', required: ['file'],
                                    properties: {
                                        file: { type: 'string', format: 'binary' },
                                        folder: { type: 'string', example: 'mbbs-cms/blogs' },
                                        displayName: { type: 'string' },
                                        altText: { type: 'string' },
                                        caption: { type: 'string' },
                                        tags: { type: 'string', description: 'Comma-separated values or a JSON array.', example: 'neet,biology,ncert' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Cloudinary upload stored in blog.blog-media.' }, 400: { description: 'Missing or unsupported file.' }, 401: { description: 'Invalid admin token.' }, 413: { description: 'File exceeds its type-specific size limit.' }, 500: { description: 'Cloudinary configuration or upload error.' } }
                }
            },
            '/api/v1/admin/blog-media/upload-multiple': {
                post: {
                    tags: ['Blog Media'], summary: 'Upload multiple files to Cloudinary', security: [{ adminBearerAuth: [] }],
                    description: 'Accepts up to 20 files. Use the multipart field name files for every selected file.',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object', required: ['files'],
                                    properties: {
                                        files: { type: 'array', maxItems: 20, items: { type: 'string', format: 'binary' } },
                                        folder: { type: 'string', example: 'mbbs-cms/blogs' },
                                        tags: { type: 'string', example: 'neet,biology' }
                                    }
                                }
                            }
                        }
                    },
                    responses: { 201: { description: 'Files uploaded and media records created.' }, 400: { description: 'Invalid files.' }, 413: { description: 'A file exceeds its size limit.' }, 500: { description: 'Cloudinary upload error; completed uploads are rolled back.' } }
                }
            },
            '/api/v1/admin/blog-media/{id}': {
                get: {
                    tags: ['Blog Media'], summary: 'Get one media record', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Media returned.' }, 400: { description: 'Invalid ID.' }, 404: { description: 'Media not found.' } }
                },
                patch: {
                    tags: ['Blog Media'], summary: 'Update media metadata', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogMediaMetadata' } } } },
                    responses: { 200: { description: 'Metadata updated.' }, 400: { description: 'Invalid update.' }, 404: { description: 'Media not found.' } }
                },
                delete: {
                    tags: ['Blog Media'], summary: 'Soft-delete media', description: 'The Cloudinary asset is retained so the record can be restored.', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Media soft-deleted.' }, 404: { description: 'Media not found.' } }
                }
            },
            '/api/v1/admin/blog-media/{id}/replace': {
                post: {
                    tags: ['Blog Media'], summary: 'Replace an existing Cloudinary asset', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' }, folder: { type: 'string' }, displayName: { type: 'string' }, altText: { type: 'string' }, caption: { type: 'string' }, tags: { type: 'string' } } } } } },
                    responses: { 200: { description: 'New asset saved and old Cloudinary asset removed.' }, 400: { description: 'Invalid replacement.' }, 404: { description: 'Media not found.' }, 500: { description: 'Cloudinary error.' } }
                }
            },
            '/api/v1/admin/blog-media/{id}/restore': {
                patch: {
                    tags: ['Blog Media'], summary: 'Restore soft-deleted media', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Media restored.' }, 404: { description: 'Media not found.' }, 409: { description: 'Media is not deleted.' } }
                }
            },
            '/api/v1/admin/blogs': {
                get: {
                    tags: ['Blogs'], summary: 'List and search blogs', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] } },
                        { name: 'visibility', in: 'query', schema: { type: 'string', enum: ['PUBLIC', 'PRIVATE', 'PASSWORD'] } },
                        { name: 'blogType', in: 'query', schema: { type: 'string', enum: ['BLOG', 'NEWS', 'ARTICLE', 'GUIDE', 'FAQ', 'CASE_STUDY'] } },
                        { name: 'category', in: 'query', schema: { type: 'string' } },
                        { name: 'author', in: 'query', schema: { type: 'string' } },
                        { name: 'tag', in: 'query', schema: { type: 'string' } },
                        { name: 'isFeatured', in: 'query', schema: { type: 'boolean' } },
                        { name: 'isTrending', in: 'query', schema: { type: 'boolean' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['title', 'createdAt', 'updatedAt', 'publishedAt', 'totalViews', 'totalLikes', 'totalComments', 'readingTime'], default: 'createdAt' } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
                    ],
                    responses: { 200: { description: 'Blogs and pagination returned.' }, 400: { description: 'Invalid query.' }, 401: { description: 'Invalid admin token.' }, 429: { description: 'Rate limit exceeded.' } }
                },
                post: {
                    tags: ['Blogs'], summary: 'Create a blog draft', security: [{ adminBearerAuth: [] }],
                    description: 'Validates all referenced records, generates the slug/code/SEO/reading time, and stores a DRAFT in blog.blogs.',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogInput' } } } },
                    responses: { 201: { description: 'Blog draft created.' }, 400: { description: 'Invalid payload or inactive relationship.' }, 401: { description: 'Invalid admin token.' }, 409: { description: 'Slug already exists.' }, 429: { description: 'Rate limit exceeded.' } }
                }
            },
            '/api/v1/admin/blogs/statistics': {
                get: { tags: ['Blogs'], summary: 'Get blog status and engagement statistics', security: [{ adminBearerAuth: [] }], responses: { 200: { description: 'Blog statistics returned.' }, 401: { description: 'Invalid admin token.' } } }
            },
            '/api/v1/admin/blogs/{id}': {
                get: {
                    tags: ['Blogs'], summary: 'Get one blog', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Blog and populated relationships returned.' }, 400: { description: 'Invalid ID.' }, 404: { description: 'Blog not found.' } }
                },
                patch: {
                    tags: ['Blogs'], summary: 'Update a blog draft or its content', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogUpdateInput' } } } },
                    responses: { 200: { description: 'Blog updated.' }, 400: { description: 'Invalid update or relationship.' }, 404: { description: 'Blog not found.' }, 409: { description: 'Slug already exists.' } }
                },
                delete: {
                    tags: ['Blogs'], summary: 'Soft-delete a blog', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Blog soft-deleted.' }, 400: { description: 'Invalid ID.' }, 404: { description: 'Blog not found.' } }
                }
            },
            '/api/v1/admin/blogs/{id}/publish': {
                post: { tags: ['Blogs'], summary: 'Publish a blog immediately', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Blog published and relationship counters updated.' }, 400: { description: 'Invalid relationship.' }, 404: { description: 'Blog not found.' } } }
            },
            '/api/v1/admin/blogs/{id}/unpublish': {
                post: { tags: ['Blogs'], summary: 'Move a published blog back to draft', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Blog unpublished.' }, 404: { description: 'Blog not found.' } } }
            },
            '/api/v1/admin/blogs/{id}/schedule': {
                post: {
                    tags: ['Blogs'], summary: 'Schedule a blog for future publication', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['scheduledAt'], properties: { scheduledAt: { type: 'string', format: 'date-time', example: '2026-08-01T10:00:00.000Z' } } } } } },
                    responses: { 200: { description: 'Blog scheduled.' }, 400: { description: 'scheduledAt must be in the future.' }, 404: { description: 'Blog not found.' } }
                }
            },
            '/api/v1/admin/blogs/{id}/duplicate': {
                post: { tags: ['Blogs'], summary: 'Duplicate a blog as a new draft', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Blog copy created.' }, 404: { description: 'Source blog not found.' } } }
            },
            '/api/v1/admin/blogs/{id}/restore': {
                patch: { tags: ['Blogs'], summary: 'Restore a soft-deleted blog as a draft', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Blog restored.' }, 404: { description: 'Blog not found.' }, 409: { description: 'Blog is not deleted or slug conflicts.' } } }
            },
            '/api/v1/admin/blogs/{id}/permanent': {
                delete: { tags: ['Blogs'], summary: 'Permanently delete a blog from database', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Blog permanently deleted.' }, 404: { description: 'Blog not found.' } } }
            },
            '/api/v1/admin/blog-authors': {
                get: {
                    tags: ['Blog Authors'],
                    summary: 'List and search blog authors',
                    description: 'Returns non-deleted authors from blog.blog_authors with pagination and optional filters.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
                        { name: 'search', in: 'query', description: 'Searches name, email, designation, biography, country, and city.', schema: { type: 'string' } },
                        { name: 'authorType', in: 'query', schema: { type: 'string', enum: ['ADMIN', 'EDITOR', 'COUNSELOR', 'DOCTOR', 'UNIVERSITY_REPRESENTATIVE', 'GUEST_AUTHOR'] } },
                        { name: 'status', in: 'query', schema: { type: 'boolean' } },
                        { name: 'isFeatured', in: 'query', schema: { type: 'boolean' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['fullName', 'displayOrder', 'totalBlogs', 'totalViews', 'createdAt', 'updatedAt'], default: 'displayOrder' } },
                        { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } }
                    ],
                    responses: {
                        200: { description: 'Authors and pagination returned.' },
                        400: { description: 'Invalid query parameters.' },
                        401: { description: 'Admin token is missing, invalid, expired, or revoked.' },
                        429: { description: 'Rate limit exceeded.' }
                    }
                },
                post: {
                    tags: ['Blog Authors'],
                    summary: 'Create a blog author',
                    description: 'Generates authorCode, slug, and default SEO values and stores the record in blog.blog_authors.',
                    security: [{ adminBearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/BlogAuthorInput' }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Author created successfully.',
                            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string' }, data: { $ref: '#/components/schemas/BlogAuthor' } } } } }
                        },
                        400: { description: 'Author payload validation failed.' },
                        401: { description: 'Admin token is missing, invalid, expired, or revoked.' },
                        409: { description: 'Author email or slug already exists.' },
                        429: { description: 'Rate limit exceeded.' }
                    }
                }
            },
            '/api/v1/admin/blog-authors/dropdown': {
                get: {
                    tags: ['Blog Authors'],
                    summary: 'Get active authors for dropdown controls',
                    security: [{ adminBearerAuth: [] }],
                    responses: {
                        200: { description: 'Compact active-author list returned.' },
                        401: { description: 'Admin token is missing or invalid.' }
                    }
                }
            },
            '/api/v1/admin/blog-authors/featured': {
                get: {
                    tags: ['Blog Authors'],
                    summary: 'Get featured authors',
                    description: 'Returns at most 10 active featured authors.',
                    security: [{ adminBearerAuth: [] }],
                    responses: {
                        200: { description: 'Featured authors returned.' },
                        401: { description: 'Admin token is missing or invalid.' }
                    }
                }
            },
            '/api/v1/admin/blog-authors/statistics': {
                get: {
                    tags: ['Blog Authors'],
                    summary: 'Get author statistics',
                    description: 'Returns active, inactive, featured, blog, and view totals.',
                    security: [{ adminBearerAuth: [] }],
                    responses: {
                        200: { description: 'Author statistics returned.' },
                        401: { description: 'Admin token is missing or invalid.' }
                    }
                }
            },
            '/api/v1/admin/blog-authors/{id}': {
                get: {
                    tags: ['Blog Authors'],
                    summary: 'Get one blog author',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: {
                        200: { description: 'Author returned.' },
                        400: { description: 'Invalid MongoDB author ID.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Author not found.' }
                    }
                },
                patch: {
                    tags: ['Blog Authors'],
                    summary: 'Update a blog author',
                    description: 'Send only the fields that need to be changed.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogAuthorUpdateInput' } } }
                    },
                    responses: {
                        200: { description: 'Author updated successfully.' },
                        400: { description: 'Invalid ID or update payload.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Author not found.' },
                        409: { description: 'Email or slug conflicts with another author.' }
                    }
                },
                delete: {
                    tags: ['Blog Authors'],
                    summary: 'Soft-delete a blog author',
                    description: 'Sets isDeleted=true and status=false; the document remains in MongoDB.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: {
                        200: { description: 'Author soft-deleted successfully.' },
                        400: { description: 'Invalid MongoDB author ID.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Author not found.' }
                    }
                }
            },
            '/api/v1/admin/blog-authors/{id}/status': {
                patch: {
                    tags: ['Blog Authors'],
                    summary: 'Activate or deactivate an author',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'boolean', example: false } } } } }
                    },
                    responses: {
                        200: { description: 'Author status updated.' },
                        400: { description: 'Invalid ID or status payload.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Author not found.' }
                    }
                }
            },
            '/api/v1/admin/blog-authors/{id}/restore': {
                patch: {
                    tags: ['Blog Authors'],
                    summary: 'Restore a soft-deleted author',
                    description: 'Restores the author and changes status to true. No request payload is required.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: {
                        200: { description: 'Author restored successfully.' },
                        400: { description: 'Invalid MongoDB author ID.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Author not found.' },
                        409: { description: 'Author is not deleted, or its email or slug now conflicts.' }
                    }
                }
            },
            '/api/v1/admin/blog-tags': {
                get: {
                    tags: ['Blog Tags'], summary: 'List and search blog tags', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'status', in: 'query', schema: { type: 'boolean' } },
                        { name: 'isFeatured', in: 'query', schema: { type: 'boolean' } },
                        { name: 'tagType', in: 'query', schema: { type: 'string' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['tagName', 'createdAt', 'updatedAt', 'displayOrder', 'totalBlogs', 'totalViews'], default: 'displayOrder' } },
                        { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } }
                    ],
                    responses: { 200: { description: 'Tags and pagination returned.' }, 400: { description: 'Invalid query.' }, 401: { description: 'Admin token is missing or invalid.' } }
                },
                post: {
                    tags: ['Blog Tags'], summary: 'Create a blog tag', security: [{ adminBearerAuth: [] }],
                    description: 'Generates tagCode, slug, and default SEO and stores the tag in blog.blog_tags.',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogTagInput' } } } },
                    responses: { 201: { description: 'Tag created.' }, 400: { description: 'Invalid tag payload.' }, 401: { description: 'Admin token is missing or invalid.' }, 409: { description: 'Tag name or slug already exists.' } }
                }
            },
            '/api/v1/admin/blog-tags/dropdown': {
                get: { tags: ['Blog Tags'], summary: 'Get active tags for dropdowns', security: [{ adminBearerAuth: [] }], responses: { 200: { description: 'Compact tag list returned.' }, 401: { description: 'Admin token is missing or invalid.' } } }
            },
            '/api/v1/admin/blog-tags/popular': {
                get: {
                    tags: ['Blog Tags'], summary: 'Get popular tags', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }, { name: 'tagType', in: 'query', schema: { type: 'string' } }],
                    responses: { 200: { description: 'Tags sorted by blog and view totals.' }, 401: { description: 'Admin token is missing or invalid.' } }
                }
            },
            '/api/v1/admin/blog-tags/statistics': {
                get: { tags: ['Blog Tags'], summary: 'Get tag statistics', security: [{ adminBearerAuth: [] }], responses: { 200: { description: 'Tag totals and usage statistics returned.' }, 401: { description: 'Admin token is missing or invalid.' } } }
            },
            '/api/v1/admin/blog-tags/{id}': {
                get: {
                    tags: ['Blog Tags'], summary: 'Get one blog tag', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Tag returned.' }, 400: { description: 'Invalid tag ID.' }, 404: { description: 'Tag not found.' } }
                },
                patch: {
                    tags: ['Blog Tags'], summary: 'Update a blog tag', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogTagUpdateInput' } } } },
                    responses: { 200: { description: 'Tag updated.' }, 400: { description: 'Invalid update.' }, 404: { description: 'Tag not found.' }, 409: { description: 'Name or slug conflict.' } }
                },
                delete: {
                    tags: ['Blog Tags'], summary: 'Soft-delete a blog tag', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Tag soft-deleted.' }, 404: { description: 'Tag not found.' }, 409: { description: 'Blogs are assigned to this tag.' } }
                }
            },
            '/api/v1/admin/blog-tags/{id}/status': {
                patch: {
                    tags: ['Blog Tags'], summary: 'Activate or deactivate a tag', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'boolean' } } } } } },
                    responses: { 200: { description: 'Tag status updated.' }, 400: { description: 'Invalid ID or status.' }, 404: { description: 'Tag not found.' } }
                }
            },
            '/api/v1/admin/blog-tags/{id}/restore': {
                patch: {
                    tags: ['Blog Tags'], summary: 'Restore a soft-deleted tag', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Tag restored.' }, 404: { description: 'Tag not found.' }, 409: { description: 'Tag is not deleted or conflicts with an active tag.' } }
                }
            },
            '/api/v1/admin/blog-categories': {
                get: {
                    tags: ['Blog Categories'], summary: 'List blog categories', security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
                        { name: 'search', in: 'query', schema: { type: 'string' } },
                        { name: 'status', in: 'query', schema: { type: 'boolean' } },
                        { name: 'isFeatured', in: 'query', schema: { type: 'boolean' } },
                        { name: 'categoryType', in: 'query', schema: { type: 'string' } },
                        { name: 'parentCategory', in: 'query', description: 'MongoDB parent ID or root.', schema: { type: 'string' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['categoryName', 'createdAt', 'updatedAt', 'displayOrder'], default: 'displayOrder' } },
                        { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } }
                    ],
                    responses: { 200: { description: 'Categories and pagination returned.' }, 400: { description: 'Invalid query.' }, 401: { description: 'Admin token is missing or invalid.' } }
                },
                post: {
                    tags: ['Blog Categories'], summary: 'Create a blog category', security: [{ adminBearerAuth: [] }],
                    description: 'Generates categoryCode, slug, hierarchy level, and default SEO automatically and stores the record in blog.blog_categories.',
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogCategoryInput' } } } },
                    responses: { 201: { description: 'Category created successfully.' }, 400: { description: 'Payload or parent category is invalid.' }, 401: { description: 'Admin token is missing or invalid.' }, 409: { description: 'Category name or slug already exists.' } }
                }
            },
            '/api/v1/admin/blog-categories/tree': {
                get: {
                    tags: ['Blog Categories'], summary: 'Get the category hierarchy', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'status', in: 'query', schema: { type: 'boolean' } }, { name: 'categoryType', in: 'query', schema: { type: 'string' } }],
                    responses: { 200: { description: 'Nested root and child categories returned.' }, 401: { description: 'Admin token is missing or invalid.' } }
                }
            },
            '/api/v1/admin/blog-categories/dropdown': {
                get: {
                    tags: ['Blog Categories'], summary: 'Get active categories for dropdowns', security: [{ adminBearerAuth: [] }],
                    responses: { 200: { description: 'Compact active category list returned.' }, 401: { description: 'Admin token is missing or invalid.' } }
                }
            },
            '/api/v1/admin/blog-categories/{id}': {
                get: {
                    tags: ['Blog Categories'], summary: 'Get one blog category', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Category returned.' }, 400: { description: 'Invalid category ID.' }, 404: { description: 'Category not found.' } }
                },
                patch: {
                    tags: ['Blog Categories'], summary: 'Update a blog category', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogCategoryUpdateInput' } } } },
                    responses: { 200: { description: 'Category updated.' }, 400: { description: 'Invalid update or parent.' }, 404: { description: 'Category not found.' }, 409: { description: 'Name or slug conflict.' } }
                },
                delete: {
                    tags: ['Blog Categories'], summary: 'Soft-delete a blog category', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Category soft-deleted.' }, 404: { description: 'Category not found.' }, 409: { description: 'Category has children or assigned blogs.' } }
                }
            },
            '/api/v1/admin/blog-categories/{id}/status': {
                patch: {
                    tags: ['Blog Categories'], summary: 'Activate or deactivate a category', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'boolean' } } } } } },
                    responses: { 200: { description: 'Category status updated.' }, 400: { description: 'Invalid ID or status.' }, 404: { description: 'Category not found.' } }
                }
            },
            '/api/v1/admin/blog-categories/{id}/restore': {
                patch: {
                    tags: ['Blog Categories'], summary: 'Restore a soft-deleted category', security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: { 200: { description: 'Category restored.' }, 400: { description: 'Parent category is invalid.' }, 404: { description: 'Category not found.' }, 409: { description: 'Category is not deleted or conflicts with an active category.' } }
                }
            },
            '/api/v1/admin/blog-templates': {
                get: {
                    tags: ['Blog Templates'],
                    summary: 'List blog templates',
                    description: 'Returns active, non-deleted template records with search, filtering, sorting, and pagination.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
                        { name: 'search', in: 'query', schema: { type: 'string' }, example: 'country' },
                        { name: 'status', in: 'query', schema: { type: 'boolean' } },
                        { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['templateName', 'createdAt', 'displayOrder'], default: 'displayOrder' } },
                        { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } }
                    ],
                    responses: {
                        200: { description: 'Templates and pagination information returned.' },
                        400: { description: 'Query parameters are invalid.', content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogTemplateError' } } } },
                        401: { description: 'Admin token is missing or invalid.' }
                    }
                },
                post: {
                    tags: ['Blog Templates'],
                    summary: 'Create a blog template',
                    description: 'Generates templateCode automatically and stores the template in the blog database under the blog-template collection.',
                    security: [{ adminBearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogTemplateInput' } } }
                    },
                    responses: {
                        201: { description: 'Template created successfully.', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'Template created successfully.' }, data: { $ref: '#/components/schemas/BlogTemplate' } } } } } },
                        400: { description: 'Request payload is invalid.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        409: { description: 'Template name or code already exists.' }
                    }
                }
            },
            '/api/v1/admin/blog-templates/{id}': {
                get: {
                    tags: ['Blog Templates'],
                    summary: 'Get one blog template',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: {
                        200: { description: 'Template returned successfully.' },
                        400: { description: 'Template ID is invalid.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Template not found.' }
                    }
                },
                patch: {
                    tags: ['Blog Templates'],
                    summary: 'Update a blog template',
                    description: 'Updates supplied fields and increments the template version.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BlogTemplateUpdateInput' } } } },
                    responses: {
                        200: { description: 'Template updated successfully.' },
                        400: { description: 'Template ID or payload is invalid.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Template not found.' }
                    }
                },
                delete: {
                    tags: ['Blog Templates'],
                    summary: 'Soft-delete a blog template',
                    description: 'Sets isDeleted, deletedAt, and disables the template without removing its database record.',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    responses: {
                        200: { description: 'Template deleted successfully.' },
                        400: { description: 'Template ID is invalid.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Template not found.' }
                    }
                }
            },
            '/api/v1/admin/blog-templates/{id}/status': {
                patch: {
                    tags: ['Blog Templates'],
                    summary: 'Activate or deactivate a blog template',
                    security: [{ adminBearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'boolean', example: false } } } } }
                    },
                    responses: {
                        200: { description: 'Template status and version updated successfully.' },
                        400: { description: 'Template ID or status is invalid.' },
                        401: { description: 'Admin token is missing or invalid.' },
                        404: { description: 'Template not found.' }
                    }
                }
            },
            '/api/v1/admin/platform-tests': {
                get: { tags: ['Platform Admin'], summary: 'List platform tests', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'is_active', in: 'query', schema: { type: 'boolean' } }, { name: 'exam_type', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Platform tests returned.' } } },
                post: { tags: ['Platform Admin'], summary: 'Create a platform test', security: [{ adminBearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['test_name', 'test_code', 'test_type', 'time_limit', 'total_questions'], properties: { test_name: { type: 'string' }, test_code: { type: 'string' }, test_type: { type: 'string' }, description: { type: 'string' }, instructions: { type: 'string' }, time_limit: { type: 'integer' }, total_questions: { type: 'integer' }, selected_topics: { type: 'array', items: { type: 'integer' } }, is_active: { type: 'boolean' }, scheduled_date_time: { type: 'string', format: 'date-time' }, exam_type: { type: 'string' } } } } } }, responses: { 201: { description: 'Platform test created.' }, 409: { description: 'ID or test code already exists.' } } }
            },
            '/api/v1/admin/platform-tests/{testId}': {
                patch: { tags: ['Platform Admin'], summary: 'Update a platform test', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'testId', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Platform test updated.' }, 404: { description: 'Platform test not found.' } } }
            },
            '/api/v1/admin/platform-tests/{testId}/status': {
                patch: { tags: ['Platform Admin'], summary: 'Activate or deactivate a platform test', description: 'Soft-deactivation preserves the test record and prevents it from being offered as active content.', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'testId', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['is_active'], properties: { is_active: { type: 'boolean', example: false } } } } } }, responses: { 200: { description: 'Platform test status updated.' }, 400: { description: 'Invalid testId or status.' }, 404: { description: 'Platform test not found.' } } }
            },
            '/api/v1/admin/test-sessions': {
                get: { tags: ['Platform Admin'], summary: 'List student test sessions', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'student_id', in: 'query', schema: { type: 'string' } }, { name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'test_type', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Test sessions returned.' } } }
            },
            '/api/v1/admin/test-sessions/{sessionId}': {
                get: { tags: ['Platform Admin'], summary: 'Get one complete test session', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Test session returned.' }, 400: { description: 'Invalid sessionId.' }, 404: { description: 'Session not found.' } } }
            },
            '/api/v1/admin/previous-year-tests': {
                get: { tags: ['Platform Admin'], summary: 'List previous-year papers including mappings', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'is_active', in: 'query', schema: { type: 'boolean' } }], responses: { 200: { description: 'Previous-year papers returned.' } } },
                post: { tags: ['Platform Admin'], summary: 'Add a previous-year paper', description: 'question_ids are optional, but when supplied every ID must exist and the mapping length must equal question_count.', security: [{ adminBearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'question_count', 'exam_type'], properties: { id: { type: 'integer' }, name: { type: 'string' }, source_filename: { type: 'string' }, question_count: { type: 'integer' }, exam_type: { type: 'string' }, is_active: { type: 'boolean' }, institution_id: { type: 'integer' }, uploaded_by_id: { type: 'integer' }, question_ids: { type: 'array', items: { type: 'integer' } } } } } } }, responses: { 201: { description: 'Previous-year paper created.' }, 400: { description: 'Metadata or mapping is invalid.' }, 409: { description: 'Paper ID already exists.' } } }
            },
            '/api/v1/admin/previous-year-tests/{paperId}': {
                patch: { tags: ['Platform Admin'], summary: 'Update metadata or question mapping for a previous-year paper', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'paperId', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Previous-year paper updated.' }, 400: { description: 'Mapping is invalid.' }, 404: { description: 'Paper not found.' } } }
            },
            '/api/v1/admin/previous-year-tests/{paperId}/status': {
                patch: { tags: ['Platform Admin'], summary: 'Activate or deactivate a previous-year test', description: 'Soft-deactivation preserves the paper and mapping but removes it from the student previous-year test list.', security: [{ adminBearerAuth: [] }], parameters: [{ name: 'paperId', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['is_active'], properties: { is_active: { type: 'boolean', example: false } } } } } }, responses: { 200: { description: 'Previous-year test status updated.' }, 400: { description: 'Invalid paperId or status.' }, 404: { description: 'Previous-year test not found.' } } }
            },
            '/api/v1/pages/home': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'Load featured and published public blogs',
                    description: 'Keeps the existing home URL and its frontend-compatible response. Returns featuredBlogs, paginated publishedBlogs, the latestBlogs alias, active categories, and featured authors. Separate blogs, authors, and categories endpoints remain available. Home SEO and breadcrumbs remain as page metadata. The response is publicly cached for five minutes.',
                    security: [],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Featured blogs, published blogs, and pagination returned successfully.' },
                        400: { description: 'Pagination is invalid.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/pages/blogs': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'List published public blogs only',
                    description: 'Dedicated blogs-only list endpoint. Returns published, public, non-deleted blogs ordered by pinned status and publication date. It does not return home SEO, featured sections, authors, categories, or testimonials.',
                    security: [],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Published blogs and pagination returned successfully.' },
                        400: { description: 'Pagination is invalid.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/pages/authors': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'List active public blog authors',
                    description: 'Returns authors separately from the home blog response. Featured authors appear first, followed by display order and name.',
                    security: [],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Authors and pagination returned successfully.' },
                        400: { description: 'Pagination is invalid.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/pages/categories': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'List active public blog categories',
                    description: 'Returns categories separately from the home blog response, ordered by display order and category name.',
                    security: [],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Categories and pagination returned successfully.' },
                        400: { description: 'Pagination is invalid.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/pages/blog/{slug}': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'Load one public blog detail page',
                    security: [],
                    parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' }, example: 'neet-preparation-guide' }],
                    responses: {
                        200: { description: 'Published blog, relations, SEO, approved reviews, and related blogs returned.' },
                        400: { description: 'Slug format is invalid.' },
                        404: { description: 'Published public blog not found.' }
                    }
                }
            },
            '/api/v1/pages/blog/{slug}/comments': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'List comments for one published blog',
                    description: 'Public endpoint for rendering a blog comment section. Comments are returned newest first with commenter display information and pagination.',
                    security: [],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Blog identity, comments, and pagination returned.' },
                        400: { description: 'Slug or pagination is invalid.' },
                        404: { description: 'Published public blog not found.' }
                    }
                },
                post: {
                    tags: ['Blog Pages'],
                    summary: 'Post a comment on one published blog',
                    description: 'Requires a logged-in student backend access token. The commenter name and student identity are read from the authenticated account, not trusted from the request body.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['comment'],
                                    properties: {
                                        comment: { type: 'string', minLength: 1, maxLength: 2000, example: 'This article was helpful.' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Comment posted and returned.' },
                        400: { description: 'Comment or slug is invalid.' },
                        401: { description: 'Student access token is missing or invalid.' },
                        404: { description: 'Published public blog not found.' }
                    }
                }
            },
            '/api/v1/pages/blog/{slug}/comments/{commentId}': {
                patch: {
                    tags: ['Blog Pages'],
                    summary: 'Edit the logged-in student’s comment',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                        { name: 'commentId', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['comment'],
                                    properties: { comment: { type: 'string', minLength: 1, maxLength: 2000 } }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Owned comment updated.' },
                        400: { description: 'Request is invalid.' },
                        401: { description: 'Student access token is missing or invalid.' },
                        404: { description: 'Blog or owned comment not found.' }
                    }
                },
                delete: {
                    tags: ['Blog Pages'],
                    summary: 'Delete the logged-in student’s comment',
                    description: 'Soft-deletes the owned comment and decrements the blog comment count.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
                        { name: 'commentId', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }
                    ],
                    responses: {
                        200: { description: 'Owned comment deleted.' },
                        400: { description: 'Request is invalid.' },
                        401: { description: 'Student access token is missing or invalid.' },
                        404: { description: 'Blog or owned comment not found.' }
                    }
                }
            },
            '/api/v1/pages/blog/{slug}/comments/{commentId}/like': {
                post: {
                    tags: ['Blog Pages'],
                    summary: 'Like a blog comment',
                    description: 'Requires a logged-in student. Repeating the request is idempotent and does not add more than one like from the same student.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } },
                        { name: 'commentId', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }
                    ],
                    responses: {
                        200: { description: 'Returns commentId, totalLikes, and isLiked=true.' },
                        400: { description: 'Slug or commentId is invalid.' },
                        401: { description: 'Student access token is missing or invalid.' },
                        404: { description: 'Published blog or active comment not found.' }
                    }
                },
                delete: {
                    tags: ['Blog Pages'],
                    summary: 'Unlike a blog comment',
                    description: 'Requires a logged-in student. Repeating the request is safe and does not decrement the count more than once.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } },
                        { name: 'commentId', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } }
                    ],
                    responses: {
                        200: { description: 'Returns commentId, totalLikes, and isLiked=false.' },
                        400: { description: 'Slug or commentId is invalid.' },
                        401: { description: 'Student access token is missing or invalid.' },
                        404: { description: 'Published blog or active comment not found.' }
                    }
                }
            },
            '/api/v1/pages/category/{slug}': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'Load a public category page',
                    security: [],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'neet-preparation' },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Category, SEO, published blogs, and pagination returned.' },
                        400: { description: 'Slug or pagination is invalid.' },
                        404: { description: 'Active category not found.' }
                    }
                }
            },
            '/api/v1/pages/tag/{slug}': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'Load a public tag page',
                    security: [],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'neet' },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Tag, SEO, published blogs, and pagination returned.' },
                        400: { description: 'Slug or pagination is invalid.' },
                        404: { description: 'Active tag not found.' }
                    }
                }
            },
            '/api/v1/pages/author/{slug}': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'Load a public author page',
                    security: [],
                    parameters: [
                        { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'dr-sanjay-kumar' },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Author, SEO, published blogs, and pagination returned.' },
                        400: { description: 'Slug or pagination is invalid.' },
                        404: { description: 'Active author not found.' }
                    }
                }
            },
            '/api/v1/pages/search': {
                get: {
                    tags: ['Blog Pages'],
                    summary: 'Load public blog search results',
                    description: 'Searches only published, public, non-deleted blogs.',
                    security: [],
                    parameters: [
                        { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 100 }, example: 'NEET biology' },
                        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } }
                    ],
                    responses: {
                        200: { description: 'Search results and pagination returned.' },
                        400: { description: 'Search query or pagination is invalid.' }
                    }
                }
            },
            '/api/v1/previous-year-tests': {
                get: {
                    tags: ['Previous Year Tests'],
                    summary: 'Step 1: List active previous-year papers',
                    description: 'Returns mapping_available and mapped_question_count. Only papers with mapping_available=true can be started.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'exam_type', in: 'query', schema: { type: 'string', example: 'neet' } }],
                    responses: {
                        200: { description: 'Active previous-year paper metadata returned.' },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/previous-year-tests/{paperId}': {
                get: {
                    tags: ['Previous Year Tests'], summary: 'Step 2: Get one previous-year paper', security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'paperId', in: 'path', required: true, schema: { type: 'integer' }, example: 15 }],
                    responses: { 200: { description: 'Paper metadata and mapping readiness returned.' }, 400: { description: 'Invalid paperId.' }, 404: { description: 'Paper not found.' } }
                }
            },
            '/api/v1/previous-year-tests/{paperId}/start': {
                post: {
                    tags: ['Previous Year Tests'], summary: 'Step 3: Start a mapped previous-year test',
                    description: 'Creates a Previous Year test session, preserves paper question order, and hides correct answers and explanations.',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'paperId', in: 'path', required: true, schema: { type: 'integer' }, example: 15 }],
                    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['duration'], properties: { duration: { type: 'number', minimum: 1, example: 200 } } } } } },
                    responses: { 201: { description: 'Session and questions returned.' }, 400: { description: 'Invalid duration or paperId.' }, 404: { description: 'Paper not found.' }, 409: { description: 'Question mapping is incomplete.' } }
                }
            },
            '/api/v1/previous-year-tests/submit': {
                post: {
                    tags: ['Previous Year Tests'], summary: 'Step 4: Submit a previous-year test',
                    description: 'Accepts only a Previous Year session owned by the student. Scoring is +4 correct, -1 wrong, and 0 skipped.',
                    security: [{ bearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitTestRequest' } } } },
                    responses: { 200: { description: 'Test scored and stored.' }, 400: { description: 'Invalid payload or answer.' }, 404: { description: 'Previous-year session not found.' }, 409: { description: 'Session already submitted.' } }
                }
            },
            '/api/v1/question-of-the-day': {
                get: {
                    tags: ['Question of the Day'],
                    summary: "Get today's Question of the Day",
                    description: 'Uses the student ID from the JWT, finds the question scheduled for today, and reports whether that student has already answered it. The correct answer is not returned by this endpoint.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: "Today's question was found.",
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            data: { $ref: '#/components/schemas/QuestionOfTheDay' }
                                        }
                                    }
                                }
                            }
                        },
                        401: {
                            description: 'JWT is missing, invalid, or expired.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        404: {
                            description: 'No question is scheduled for today.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        500: {
                            description: 'An unexpected server or database error occurred.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        }
                    }
                }
            },
            '/api/v1/question-of-the-day/submit': {
                post: {
                    tags: ['Question of the Day'],
                    summary: "Submit an answer to today's question",
                    description: 'Validates the selected option, prevents a student from submitting twice, saves the result, and then returns the correct answer and explanation.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/QuestionSubmissionRequest' }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'The answer was saved successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string', example: 'Answer submitted successfully.' },
                                            data: { $ref: '#/components/schemas/QuestionSubmissionResult' }
                                        }
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'A required field is missing or selected_option is not A, B, C, or D.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        401: {
                            description: 'JWT is missing, invalid, or expired.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        404: {
                            description: 'The supplied question_id does not exist.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        409: {
                            description: 'The logged-in student has already answered this question.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        },
                        500: {
                            description: 'An unexpected server or database error occurred.',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
                        }
                    }
                }
            },
            '/api/v1/question-of-the-day/streak': {
                get: {
                    tags: ['Question of the Day'],
                    summary: 'Get the logged-in student QOD streak',
                    description: 'Rebuilds the streak summary from unique QOD participation days and stores it in qod-streaks. A current streak remains active when the last answer was today or yesterday.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Current and longest streak statistics returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            data: { $ref: '#/components/schemas/QodStreak' }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/question-of-the-day/streak/history': {
                get: {
                    tags: ['Question of the Day'],
                    summary: 'Get monthly QOD streak history',
                    description: 'Returns unique QOD participation dates for the requested month. The current month is used when month is omitted.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'month',
                            in: 'query',
                            required: false,
                            schema: { type: 'string', pattern: '^\\d{4}-(0[1-9]|1[0-2])$' },
                            example: '2026-07'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Monthly QOD answer history returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            month: { type: 'string', example: '2026-07' },
                                            timezone: { type: 'string', example: 'Asia/Kolkata' },
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/QodStreakHistoryEntry' }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'month is not in YYYY-MM format.' },
                        401: { description: 'Student token is missing, invalid, expired, or revoked.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/questions': {
                get: {
                    tags: ['UCAT Questions'],
                    summary: 'List UCAT questions with pagination and filters',
                    description: 'Retrieve active UCAT questions filtered by section, topic, difficulty, or questionType.',
                    parameters: [
                        {
                            name: 'section',
                            in: 'query',
                            required: false,
                            schema: {
                                type: 'string',
                                enum: ['VERBAL_REASONING', 'DECISION_MAKING', 'QUANTITATIVE_REASONING', 'SITUATIONAL_JUDGEMENT']
                            },
                            description: 'UCAT exam section'
                        },
                        {
                            name: 'topic',
                            in: 'query',
                            required: false,
                            schema: { type: 'string' },
                            description: 'Topic name filter'
                        },
                        {
                            name: 'difficulty',
                            in: 'query',
                            required: false,
                            schema: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
                            description: 'Difficulty level'
                        },
                        {
                            name: 'questionType',
                            in: 'query',
                            required: false,
                            schema: { type: 'string' },
                            description: 'Question type classification'
                        },
                        {
                            name: 'page',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', default: 1 },
                            description: 'Page number'
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', default: 20, maximum: 100 },
                            description: 'Items per page'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'UCAT questions fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatQuestionListResponse' }
                                }
                            }
                        },
                        400: { description: 'Invalid section or filter parameter.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/admin/questions/filters': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get available UCAT filter options',
                    description: 'Returns distinct sections, topics, and difficulties from active UCAT questions for admin management.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'UCAT filter metadata returned.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatFiltersResponse' }
                                }
                            }
                        },
                        401: { description: 'Platform admin access token is required or expired.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/admin/questions/section/{section}': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get UCAT questions by section',
                    description: 'Returns active UCAT questions belonging to a specific section for platform admins.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'section',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'string',
                                enum: ['VERBAL_REASONING', 'DECISION_MAKING', 'QUANTITATIVE_REASONING', 'ABSTRACT_REASONING', 'SITUATIONAL_JUDGEMENT']
                            },
                            description: 'Target UCAT section'
                        },
                        {
                            name: 'page',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', default: 20, maximum: 100 }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Section questions returned.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatQuestionListResponse' }
                                }
                            }
                        },
                        400: { description: 'Invalid UCAT section name.' },
                        401: { description: 'Platform admin access token is required or expired.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/admin/questions/topic/{topic}': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get UCAT questions by topic',
                    description: 'Returns active UCAT questions belonging to a specific topic for platform admins.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'topic',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                            description: 'Topic name'
                        },
                        {
                            name: 'page',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            required: false,
                            schema: { type: 'integer', default: 20, maximum: 100 }
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Topic questions returned.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatQuestionListResponse' }
                                }
                            }
                        },
                        400: { description: 'Topic is required.' },
                        401: { description: 'Platform admin access token is required or expired.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/questions/{id}': {
                get: {
                    tags: ['UCAT Questions'],
                    summary: 'Get a single UCAT question by numeric ID',
                    description: 'Returns complete question details including correct answer and explanation.',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' },
                            description: 'Numeric question ID'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'UCAT question details returned.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            message: { type: 'string', example: 'UCAT question fetched successfully.' },
                                            data: { $ref: '#/components/schemas/UcatQuestion' }
                                        }
                                    }
                                }
                            }
                        },
                        400: { description: 'Valid question ID is required.' },
                        404: { description: 'Question not found.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/topics': {
                get: {
                    tags: ['UCAT Topics'],
                    summary: 'List all active UCAT topics',
                    description: 'Retrieve all active UCAT topics sorted by section and display order.',
                    responses: {
                        200: {
                            description: 'UCAT topics fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatTopicListResponse' }
                                }
                            }
                        },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/admin/topics/section/{section}/names': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get topic names and IDs for a section',
                    description: 'Returns topic metadata (id, name, section) for a specific exam section for platform admins.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'section',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'string',
                                enum: ['VERBAL_REASONING', 'DECISION_MAKING', 'QUANTITATIVE_REASONING', 'ABSTRACT_REASONING', 'SITUATIONAL_JUDGEMENT']
                            },
                            description: 'Target UCAT section'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Topic list fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatTopicNameListResponse' }
                                }
                            }
                        },
                        400: { description: 'Invalid UCAT section.' },
                        401: { description: 'Platform admin access token is required or expired.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/admin/topics/section/{section}': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get full topic details for a section',
                    description: 'Returns complete topic objects for a specific UCAT section for platform admins.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'section',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'string',
                                enum: ['VERBAL_REASONING', 'DECISION_MAKING', 'QUANTITATIVE_REASONING', 'ABSTRACT_REASONING', 'SITUATIONAL_JUDGEMENT']
                            },
                            description: 'Target UCAT section'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Section topics fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatTopicListResponse' }
                                }
                            }
                        },
                        400: { description: 'Invalid UCAT section.' },
                        401: { description: 'Platform admin access token is required or expired.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/topics/{id}': {
                get: {
                    tags: ['UCAT Topics'],
                    summary: 'Get single UCAT topic by numeric ID',
                    description: 'Returns full topic details for a specific numeric topic ID.',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' },
                            description: 'Numeric topic ID'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'Topic fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatTopicSingleResponse' }
                                }
                            }
                        },
                        400: { description: 'Valid topic ID is required.' },
                        404: { description: 'UCAT topic not found.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/test/subjects': {
                get: {
                    tags: ['UCAT Practice Tests'],
                    summary: 'Step 1: Get available UCAT subjects / sections',
                    description: 'Returns available canonical UCAT exam sections (VERBAL_REASONING, DECISION_MAKING, etc.).',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'UCAT subjects fetched successfully.' },
                        401: { description: 'Authentication required.' }
                    }
                }
            },
            '/api/v1/ucat/test/chapters': {
                post: {
                    tags: ['UCAT Practice Tests'],
                    summary: 'Step 2: Get chapters for selected UCAT subjects',
                    description: 'Returns distinct chapters belonging to the selected UCAT subjects.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['subjects'],
                                    properties: {
                                        subjects: {
                                            type: 'array',
                                            items: { type: 'string' },
                                            example: ['VERBAL_REASONING', 'DECISION_MAKING']
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'UCAT chapters fetched successfully.' },
                        400: { description: 'Please select subject.' },
                        401: { description: 'Authentication required.' }
                    }
                }
            },
            '/api/v1/ucat/test/topics': {
                post: {
                    tags: ['UCAT Practice Tests'],
                    summary: 'Step 3: Get topics for selected chapters',
                    description: 'Returns topic documents for selected UCAT subjects and chapters.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        subjects: { type: 'array', items: { type: 'string' }, example: ['VERBAL_REASONING'] },
                                        chapters: { type: 'array', items: { type: 'string' }, example: ['Verbal Reasoning'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'UCAT topics fetched successfully.' },
                        401: { description: 'Authentication required.' }
                    }
                }
            },
            '/api/v1/ucat/test/start': {
                post: {
                    tags: ['UCAT Practice Tests'],
                    summary: 'Step 4: Start a quick or custom practice test session',
                    description: 'Creates a custom practice test session filtered by chosen sections, topics, question limit, and time limit.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UcatTestStartRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'UCAT test session started successfully.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/test/submit': {
                post: {
                    tags: ['UCAT Practice Tests'],
                    summary: 'Submit practice test answer sheet',
                    description: 'Submits selected answer options for a test session, evaluates marks (+4/-1), and calculates accuracy percentage.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UcatTestSubmitRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'UCAT test submitted successfully.' },
                        404: { description: 'Test session not found.' },
                        500: { description: 'Server or database error.' }
                    }
                }
            },
            '/api/v1/ucat/test/sessions/{sessionId}': {
                get: {
                    tags: ['UCAT Practice Tests'],
                    summary: 'Get active test session state',
                    description: 'Returns test session state and question payload for an active test attempt.',
                    parameters: [
                        { name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'UCAT test session fetched successfully.' },
                        404: { description: 'Test session not found.' }
                    }
                }
            },
            '/api/v1/ucat/test/sessions/{sessionId}/result': {
                get: {
                    tags: ['UCAT Practice Tests'],
                    summary: 'Get test result score & question-by-question analysis',
                    description: 'Returns total marks, accuracy percentage, correct/incorrect counts, and detailed answer explanations.',
                    parameters: [
                        { name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'UCAT test result fetched successfully.' },
                        404: { description: 'Test session not found.' }
                    }
                }
            },
            '/api/v1/ucat/test/history': {
                get: {
                    tags: ['UCAT Practice Tests'],
                    summary: 'Get user test history',
                    description: 'Returns paginated list of completed practice test sessions.',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
                    ],
                    responses: {
                        200: { description: 'UCAT test history fetched successfully.' }
                    }
                }
            },
            '/api/v1/ucat/previous-year-tests': {
                get: {
                    tags: ['UCAT Previous Year Tests'],
                    summary: 'List available past UCAT examination papers',
                    description: 'Returns available past year examination papers sorted by year.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: { description: 'Previous year UCAT papers fetched successfully.' }
                    }
                }
            },
            '/api/v1/ucat/previous-year-tests/sessions/{sessionId}/result': {
                get: {
                    tags: ['UCAT Previous Year Tests'],
                    summary: 'Get completed previous-year test result & answer review',
                    description: 'Returns total marks, accuracy percentage, correct/incorrect counts, and detailed answer explanations for a previous-year test session.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'Previous-year UCAT test session result fetched successfully.' },
                        404: { description: 'Test session not found.' }
                    }
                }
            },
            '/api/v1/ucat/previous-year-tests/sessions/{sessionId}': {
                get: {
                    tags: ['UCAT Previous Year Tests'],
                    summary: 'Get active previous-year test session state',
                    description: 'Returns active session details and question payload for a previous-year test attempt.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'Previous-year UCAT test session state fetched successfully.' },
                        404: { description: 'Test session not found.' }
                    }
                }
            },
            '/api/v1/ucat/previous-year-tests/{paperId}': {
                get: {
                    tags: ['UCAT Previous Year Tests'],
                    summary: 'Get past examination paper details',
                    description: 'Returns complete past exam paper details and question list.',
                    parameters: [
                        { name: 'paperId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'Previous year UCAT paper fetched successfully.' },
                        404: { description: 'Paper not found.' }
                    }
                }
            },
            '/api/v1/ucat/previous-year-tests/{paperId}/start': {
                post: {
                    tags: ['UCAT Previous Year Tests'],
                    summary: 'Start a mapped previous-year test',
                    description: 'Generates a mapped test session for a past UCAT examination paper.',
                    parameters: [
                        { name: 'paperId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    requestBody: {
                        required: false,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        limit: { type: 'number', example: 30 },
                                        duration: { type: 'number', example: 120 }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Previous year UCAT paper test session started successfully.' },
                        404: { description: 'Paper not found.' }
                    }
                }
            },
            '/api/v1/ucat/previous-year-tests/submit': {
                post: {
                    tags: ['UCAT Previous Year Tests'],
                    summary: 'Submit past paper exam answers',
                    description: 'Submits selected answer options for a past paper exam session, evaluates marks (+4/-1), and returns score summary.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UcatTestSubmitRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Previous year test submitted successfully.',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/UcatSubmitResponse' }
                                }
                            }
                        },
                        404: { description: 'Paper test session not found.' }
                    }
                }
            },
            '/api/v1/ucat/admin/dashboard': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'UCAT Admin dashboard analytics',
                    description: 'Returns total question count, topic count, test session count, and previous year paper count.',
                    responses: {
                        200: { description: 'UCAT Admin dashboard analytics fetched successfully.' }
                    }
                }
            },
            '/api/v1/ucat/admin/questions': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'List & search UCAT questions (Admin)',
                    description: 'Returns paginated question documents with subject, topic, and text search filters.',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                        { name: 'subject', in: 'query', schema: { type: 'string' } },
                        { name: 'topic', in: 'query', schema: { type: 'string' } },
                        { name: 'search', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'UCAT questions fetched successfully.' }
                    }
                },
                post: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Create a new UCAT question (Admin)',
                    description: 'Creates a new question document in the UCAT questions repository.',
                    responses: {
                        201: { description: 'UCAT question created successfully.' },
                        400: { description: 'Invalid input data.' }
                    }
                }
            },
            '/api/v1/ucat/admin/questions/{id}': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get single question details (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Question fetched successfully.' }, 404: { description: 'Question not found.' } }
                },
                patch: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Update UCAT question details (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Question updated successfully.' }, 404: { description: 'Question not found.' } }
                },
                delete: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Delete UCAT question document (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Question deleted successfully.' }, 404: { description: 'Question not found.' } }
                }
            },
            '/api/v1/ucat/admin/topics': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'List & search UCAT topics (Admin)',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
                        { name: 'subject', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: { 200: { description: 'Topics fetched successfully.' } }
                },
                post: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Create a new UCAT topic (Admin)',
                    responses: { 201: { description: 'Topic created successfully.' } }
                }
            },
            '/api/v1/ucat/admin/topics/{id}': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get single topic details (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Topic fetched successfully.' }, 404: { description: 'Topic not found.' } }
                },
                patch: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Update UCAT topic details (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Topic updated successfully.' }, 404: { description: 'Topic not found.' } }
                },
                delete: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Delete UCAT topic document (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Topic deleted successfully.' }, 404: { description: 'Topic not found.' } }
                }
            },
            '/api/v1/ucat/admin/test-sessions': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Monitor student test sessions (Admin)',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                        { name: 'status', in: 'query', schema: { type: 'string' } },
                        { name: 'student_id', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: { 200: { description: 'Test sessions fetched successfully.' } }
                }
            },
            '/api/v1/ucat/admin/test-sessions/{id}': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get full student test session attempt (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Test session details fetched successfully.' }, 404: { description: 'Test session not found.' } }
                }
            },
            '/api/v1/ucat/admin/previous-year-tests': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'List previous year exam papers (Admin)',
                    responses: { 200: { description: 'Previous year papers fetched successfully.' } }
                },
                post: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Create a new previous year paper record (Admin)',
                    responses: { 201: { description: 'Previous year paper created successfully.' } }
                }
            },
            '/api/v1/ucat/admin/previous-year-tests/{id}': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get single previous year paper details (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Paper fetched successfully.' }, 404: { description: 'Paper not found.' } }
                },
                patch: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Update previous year paper details (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Paper updated successfully.' }, 404: { description: 'Paper not found.' } }
                },
                delete: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Delete previous year paper record (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Paper deleted successfully.' }, 404: { description: 'Paper not found.' } }
                }
            },
            '/api/v1/ucat/admin/streaks': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'List student streaks (Admin)',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
                    ],
                    responses: { 200: { description: 'Student streaks fetched successfully.' } }
                }
            },
            '/api/v1/ucat/admin/streaks/{studentId}': {
                patch: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Update student streak record (Admin)',
                    parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Student streak updated successfully.' } }
                }
            },
            '/api/v1/ucat/admin/chat-sessions': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'List AI review chat sessions (Admin)',
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
                    ],
                    responses: { 200: { description: 'Chat sessions fetched successfully.' } }
                }
            },
            '/api/v1/ucat/admin/chat-sessions/{id}/messages': {
                get: {
                    tags: ['UCAT Platform Admin'],
                    summary: 'Get message log for an AI review chat session (Admin)',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: { 200: { description: 'Chat messages fetched successfully.' } }
                }
            },
            '/api/v1/ucat/streaks': {
                get: {
                    tags: ['UCAT Streaks'],
                    summary: 'Get current user practice streak statistics',
                    description: 'Returns current streak, longest streak, and last activity date.',
                    responses: {
                        200: { description: 'UCAT streak fetched successfully.' }
                    }
                }
            },
            '/api/v1/ucat/streaks/record': {
                post: {
                    tags: ['UCAT Streaks'],
                    summary: 'Record daily practice activity to update streak',
                    description: 'Records today practice activity and updates current & longest streaks.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UcatStreakRecordRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'UCAT daily streak recorded successfully.' }
                    }
                }
            },
            '/api/v1/ucat/chat/sessions': {
                get: {
                    tags: ['UCAT AI Review Chat'],
                    summary: 'List user active AI review chat sessions',
                    description: 'Returns all active AI tutor review chat sessions.',
                    responses: {
                        200: { description: 'UCAT chat sessions fetched successfully.' }
                    }
                },
                post: {
                    tags: ['UCAT AI Review Chat'],
                    summary: 'Create a new AI review chat session for a test',
                    description: 'Initiates a new AI tutor chat session grounded in wrong answers from a test session.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UcatChatSessionCreateRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'UCAT chat session created successfully.' }
                    }
                }
            },
            '/api/v1/ucat/chat/sessions/{chatSessionId}': {
                get: {
                    tags: ['UCAT AI Review Chat'],
                    summary: 'Get AI chat session details',
                    description: 'Returns session details for a specific chat session ID.',
                    parameters: [
                        { name: 'chatSessionId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'UCAT chat session fetched successfully.' },
                        404: { description: 'Chat session not found.' }
                    }
                }
            },
            '/api/v1/ucat/chat/sessions/{chatSessionId}/messages': {
                get: {
                    tags: ['UCAT AI Review Chat'],
                    summary: 'Get chat conversation message history',
                    description: 'Returns message history between user and AI tutor for a chat session.',
                    parameters: [
                        { name: 'chatSessionId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'UCAT chat messages fetched successfully.' }
                    }
                },
                post: {
                    tags: ['UCAT AI Review Chat'],
                    summary: 'Send message to AI tutor for test review',
                    description: 'Sends a user question to the AI tutor and returns the assistant response.',
                    parameters: [
                        { name: 'chatSessionId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UcatChatMessageSendRequest' }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Message sent successfully.' }
                    }
                }
            },
            '/api/v1/ucat/insights/generate': {
                post: {
                    tags: ['UCAT Performance Insights'],
                    summary: 'Generate section accuracy & weak zone insights for a test session',
                    description: 'Evaluates completed test session scores to generate strong/weak section insights.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UcatZoneInsightGenerateRequest' }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'UCAT zone insight generated successfully.' }
                    }
                }
            },
            '/api/v1/ucat/insights/test-zone-insights/{testSessionId}': {
                get: {
                    tags: ['UCAT Performance Insights'],
                    summary: 'Get stored zone insights for a test session',
                    description: 'Returns weak section recommendations and accuracy insights for a specific test session.',
                    parameters: [
                        { name: 'testSessionId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'UCAT zone insight fetched successfully.' },
                        404: { description: 'Zone insight not found.' }
                    }
                }
            },
            '/api/v1/student/dashboard/summary': {
                get: {
                    tags: ['Student Dashboard'],
                    summary: 'Get aggregated student dashboard summary',
                    description: 'Returns real-time personalized dashboard snapshot including student profile, QOD streak stats, overall test performance, subject breakdown, AI focus zones, unread notifications, and recent test sessions.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Student dashboard summary fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string', example: 'Student dashboard summary fetched successfully.' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    profile: { type: 'object' },
                                                    streak: { type: 'object' },
                                                    performance_summary: { type: 'object' },
                                                    subject_breakdown: { type: 'array', items: { type: 'object' } },
                                                    insights: { type: 'object' },
                                                    recent_tests: { type: 'array', items: { type: 'object' } },
                                                    notifications: { type: 'object' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Please login to access this resource.' },
                        500: { description: 'An unexpected server error occurred.' }
                    }
                }
            },
            '/api/v1/student/dashboard/stats': {
                get: {
                    tags: ['Student Dashboard'],
                    summary: 'Get top-level KPI stats cards',
                    description: 'Returns compact KPI card stats (streak, tests completed, total questions solved, overall accuracy, practice time in minutes).',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Student dashboard KPI stats fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string', example: 'Student dashboard KPI stats fetched successfully.' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    current_streak: { type: 'number', example: 5 },
                                                    longest_streak: { type: 'number', example: 12 },
                                                    answered_today: { type: 'boolean', example: true },
                                                    tests_completed: { type: 'number', example: 14 },
                                                    total_questions_solved: { type: 'number', example: 280 },
                                                    overall_accuracy: { type: 'number', example: 82.5 },
                                                    practice_time_minutes: { type: 'number', example: 120 }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Please login to access this resource.' }
                    }
                }
            },
            '/api/v1/student/dashboard/performance': {
                get: {
                    tags: ['Student Dashboard'],
                    summary: 'Get detailed student performance metrics',
                    description: 'Provides analytical breakdowns including subject-wise accuracy, test type comparison (Quick Test vs PYQ), and recent test score trends.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Student performance analytics fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string', example: 'Student performance analytics fetched successfully.' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    subject_performance: { type: 'array', items: { type: 'object' } },
                                                    test_type_performance: { type: 'array', items: { type: 'object' } },
                                                    recent_test_trend: { type: 'array', items: { type: 'object' } }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Please login to access this resource.' }
                    }
                }
            },
            '/api/v1/student/dashboard/recent-activity': {
                get: {
                    tags: ['Student Dashboard'],
                    summary: 'Get paginated student recent activity timeline',
                    description: 'Returns student activity timeline (completed tests, QOD attempts, profile updates) with page & limit pagination parameters.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 10 } }
                    ],
                    responses: {
                        200: {
                            description: 'Student activity history fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string', example: 'Student activity history fetched successfully.' },
                                            data: { type: 'array', items: { type: 'object' } },
                                            pagination: {
                                                type: 'object',
                                                properties: {
                                                    total: { type: 'number', example: 15 },
                                                    page: { type: 'number', example: 1 },
                                                    limit: { type: 'number', example: 10 },
                                                    pages: { type: 'number', example: 2 }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Please login to access this resource.' }
                    }
                }
            },
            '/api/v1/student/dashboard/saved-blogs': {
                get: {
                    tags: ['Student Dashboard'],
                    summary: 'Get authenticated student saved blogs for dashboard',
                    description: 'Returns list of student bookmarked blogs formatted with full metadata (title, slug, excerpt, featured image, author, category, reading time).',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 20 } }
                    ],
                    responses: {
                        200: {
                            description: 'Saved blogs fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string', example: 'Saved blogs fetched successfully.' },
                                            data: { type: 'array', items: { type: 'object' } },
                                            pagination: { type: 'object' }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Please login to access this resource.' }
                    }
                }
            },
            '/api/v1/student/dashboard/university-finder/saved-universities': {
                get: {
                    tags: ['Student Dashboard'],
                    summary: 'Get saved target MBBS universities',
                    description: 'Returns all universities bookmarked by the student for quick access on their dashboard.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'Saved target universities fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string', example: 'Saved target universities fetched successfully.' },
                                            data: { type: 'array', items: { type: 'object' } }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Please login to access this resource.' }
                    }
                }
            },
            '/api/v1/student/dashboard/university-finder/save-university': {
                post: {
                    tags: ['Student Dashboard'],
                    summary: 'Bookmark / save target MBBS university',
                    description: 'Saves a university to the student\'s dashboard target list.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['university_id', 'university_name'],
                                    properties: {
                                        university_id: { type: 'string', example: 'UNI-RUS-001' },
                                        university_name: { type: 'string', example: 'Kazan Federal University' },
                                        slug: { type: 'string', example: 'kazan-federal-university' },
                                        country: { type: 'string', example: 'Russia' },
                                        logo_url: { type: 'string', example: 'https://api.mbbs.net/logos/kazan.png' },
                                        tuition_fee_approx: { type: 'string', example: '$4,500 / year' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'University saved to student dashboard successfully.' },
                        400: { description: 'university_id and university_name are required.' },
                        401: { description: 'Please login to access this resource.' }
                    }
                }
            },
            '/api/v1/student/dashboard/university-finder/save-university/{universityId}': {
                delete: {
                    tags: ['Student Dashboard'],
                    summary: 'Remove saved university from dashboard',
                    description: 'Removes a university from the student\'s bookmarked target list.',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'universityId', in: 'path', required: true, schema: { type: 'string' } }
                    ],
                    responses: {
                        200: { description: 'University removed from saved list successfully.' },
                        401: { description: 'Please login to access this resource.' }
                    }
                }
            },
            '/api/v1/student/dashboard/university-finder/recommendations': {
                get: {
                    tags: ['Student Dashboard'],
                    summary: 'Get saved University Finder recommendation sessions',
                    description: 'Returns previous eligibility search submissions and ranked matching university recommendations.',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'University Finder recommendation sessions fetched successfully.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'success' },
                                            message: { type: 'string', example: 'University Finder recommendation sessions fetched successfully.' },
                                            data: { type: 'array', items: { type: 'object' } }
                                        }
                                    }
                                }
                            }
                        },
                        401: { description: 'Please login to access this resource.' }
                    }
                },
                post: {
                    tags: ['Student Dashboard'],
                    summary: 'Save University Finder quiz recommendation results',
                    description: 'Stores a student\'s CSE questionnaire answers and matching university recommendations for dashboard review.',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        country_id: { type: 'string', example: 'russia' },
                                        country_name: { type: 'string', example: 'Russia' },
                                        budget_range: { type: 'string', example: '$4000-$6000' },
                                        pcb_score: { type: 'number', example: 75 },
                                        neet_score: { type: 'number', example: 350 },
                                        matched_universities: { type: 'array', items: { type: 'object' } }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'University Finder recommendation session saved successfully.' },
                        401: { description: 'Please login to access this resource.' }
                    }
                }
            }
        }
    },
    apis: []
};

module.exports = swaggerJsdoc(swaggerOptions);
