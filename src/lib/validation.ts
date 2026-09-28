/**
 * Runtime validation schemas using Zod for YAML data files.
 * These schemas match the RxDB JSON schemas in types.ts and provide
 * runtime validation during build to catch data errors early.
 */

import { z } from "zod";
import { iconNames } from "./icon-registry";

// ==============================================================================
// == Enums =====================================================================
// ==============================================================================

export const TagTypeSchema = z.enum(["other", "award", "venue", "tapeout"]);

export const NewsTypeSchema = z.enum(["other"]);

export const MemberRoleSchema = z.enum([
  "other",
  "pi",
  "phd",
  "ms",
  "ug",
  "postdoc",
  "staff",
  "visitor",
]);

// Dynamic icon schema based on available FontAwesome icons
// Uses runtime validation since iconNames is dynamically generated
export const IconSchema = z.string().superRefine((val, ctx) => {
  if (!iconNames.includes(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid icon name "${val}". Must be a valid FontAwesome icon name (e.g., "github", "linkedin", "file-pdf", etc.)`,
    });
  }
});

// ==============================================================================
// == Tag =======================================================================
// ==============================================================================

export const TagSchema = z.object({
  label: z.string(),
  type: TagTypeSchema,
  link: z.string().optional(), // Can be relative or absolute URL
  icon: IconSchema.optional(),
});

// ==============================================================================
// == Person ====================================================================
// ==============================================================================

const LinkSchema = z.object({
  link: z.string().url({ message: "Must be a valid URL" }),
  icon: IconSchema.optional(),
  label: z.string().optional(),
});

const MemberInfoSchema = z.object({
  role: MemberRoleSchema,
  whenJoined: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Must be YYYY-MM-DD format" }),
  whenLeft: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Must be YYYY-MM-DD format" })
    .optional(),
  position: z.string().optional(),
  email: z.string().email({ message: "Must be a valid email" }).optional(),
  office: z.string().optional(),
  links: z.array(LinkSchema).optional(),
  selectedPubIds: z.array(z.string()).optional(),
});

export const PersonSchema = z.object({
  id: z.string().max(32),
  firstname: z.string().max(50),
  lastname: z.string().max(50),
  goby: z.string().optional(),
  middlename: z.string().optional(),
  avatar: z.string().optional(),
  externalLink: z.string().url({ message: "Must be a valid URL" }).optional(),
  memberInfo: MemberInfoSchema.optional(),
  // RxDB metadata fields
  _meta: z
    .object({
      lwt: z.number(),
    })
    .optional(),
  _deleted: z.boolean().optional(),
  _rev: z.string().optional(),
  _attachments: z.record(z.string(), z.any()).optional(),
});

// ==============================================================================
// == Publication ===============================================================
// ==============================================================================

const AttachmentSchema = z.object({
  label: z.string(),
  link: z.string(), // Can be relative or absolute URL
  icon: IconSchema.optional(),
});

export const PublicationSchema = z.object({
  id: z.string().max(32),
  title: z.string(),
  authorIds: z
    .array(z.string())
    .min(1, { message: "Must have at least one author" }),
  time: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Must be YYYY-MM-DD format" }),
  booktitle: z.string().optional(),
  doi: z.string().optional(),
  bibtex: z.string().optional(),
  arxivDoi: z.string().optional(),
  arxivBibtex: z.string().optional(),
  authorsCopy: z.string().optional(), // Can be relative or absolute URL
  equalContrib: z.number().int().nonnegative().optional(),
  notPncel: z.boolean().optional(),
  tags: z.array(TagSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
  // RxDB metadata fields
  _meta: z
    .object({
      lwt: z.number(),
    })
    .optional(),
  _deleted: z.boolean().optional(),
  _rev: z.string().optional(),
  _attachments: z.record(z.string(), z.any()).optional(),
});

// ==============================================================================
// == Photo =====================================================================
// ==============================================================================

export const PhotoSchema = z.object({
  id: z.string().max(32),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  image: z.string(),
  thumbnail: z.string().optional(),
  time: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Must be YYYY-MM-DD format" }),
  // RxDB metadata fields
  _meta: z
    .object({
      lwt: z.number(),
    })
    .optional(),
  _deleted: z.boolean().optional(),
  _rev: z.string().optional(),
  _attachments: z.record(z.string(), z.any()).optional(),
});

// ==============================================================================
// == YAML File Schemas =========================================================
// ==============================================================================

export const PersonsYamlSchema = z.object({
  name: z.literal("persons"),
  schemaHash: z.string(),
  docs: z.array(PersonSchema),
});

export const PublicationsYamlSchema = z.object({
  name: z.enum(["pubs", "publications"]), // Support both names
  schemaHash: z.string(),
  docs: z.array(PublicationSchema),
});

export const PhotosYamlSchema = z.object({
  name: z.literal("photos"),
  schemaHash: z.string(),
  docs: z.array(PhotoSchema),
});

// ==============================================================================
// == Helper Functions ==========================================================
// ==============================================================================

/**
 * Validates a data object against a schema and returns detailed errors.
 *
 * The raw `issues` come back alongside the formatted strings: their structured
 * paths let a caller that still has the source document resolve each failure
 * back to the line and text that produced it.
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
):
  | { success: true; data: T }
  | { success: false; errors: string[]; issues: z.ZodIssue[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((err: z.ZodIssue) => {
    const path = err.path.join(".");
    return `${context}${path ? ` at "${path}"` : ""}: ${err.message}`;
  });

  return { success: false, errors, issues: result.error.issues };
}

/**
 * Validates persons YAML data
 */
export function validatePersonsYaml(data: unknown) {
  return validateData(PersonsYamlSchema, data, "persons.yaml");
}

/**
 * Validates publications YAML data
 */
export function validatePublicationsYaml(data: unknown) {
  return validateData(PublicationsYamlSchema, data, "pubs.yaml");
}

/**
 * Validates photos YAML data
 */
export function validatePhotosYaml(data: unknown) {
  return validateData(PhotosYamlSchema, data, "photos.yaml");
}
