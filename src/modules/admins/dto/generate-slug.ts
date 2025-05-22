import { PrismaClient } from '@prisma/client';

export async function generateSlug(
  name: string,
  database: PrismaClient,
): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // faqat a-z, 0-9, bo‘shliq va tire qoldiradi
    .replace(/\s+/g, '-') // bo‘shliqlarni `-` ga o‘zgartiradi
    .replace(/-+/g, '-'); // ketma-ket tirelarni bitta qiladi

  let slug = baseSlug;
  let counter = 1;

  while (await database.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
