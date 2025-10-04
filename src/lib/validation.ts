import { z } from 'zod';

// Authentication validation
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Submission validation
export const submissionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  what: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  when: z
    .string()
    .trim()
    .max(500, 'When/where must be less than 500 characters')
    .optional(),
  verify: z
    .string()
    .trim()
    .min(1, 'Verification information is required')
    .max(2000, 'Verification must be less than 2000 characters'),
  contact: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Contact must be less than 255 characters')
    .optional()
    .or(z.literal('')),
});

// Post/ComposeBox validation
export const aliasSchema = z
  .string()
  .trim()
  .min(1, 'Alias is required')
  .max(50, 'Alias must be less than 50 characters')
  .regex(
    /^[a-zA-Z0-9_\-\s]+$/,
    'Alias can only contain letters, numbers, spaces, hyphens, and underscores'
  );

export const postContentSchema = z
  .string()
  .trim()
  .min(1, 'Post content is required')
  .max(2000, 'Post must be less than 2000 characters');

export const postSchema = z.object({
  content: postContentSchema,
  alias: aliasSchema,
});

// Admin notes validation
export const adminNotesSchema = z
  .string()
  .trim()
  .max(2000, 'Notes must be less than 2000 characters')
  .optional();

// Sanitization helpers
export const sanitizeHtml = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeInput = (text: string): string => {
  return text.trim().slice(0, 5000);
};
