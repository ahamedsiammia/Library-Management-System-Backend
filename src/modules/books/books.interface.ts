import { BookStatus } from "../../../generated/prisma/enums";

export interface IBookQuery {
  page?: string;
  search?: string;
  category?: string;
}


export interface ICreateBook {
  title: string;
  titleBn?: string;
  author: string;
  authorBio?: string;
  category: string;
  categoryBn?: string;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  coverImage: string;
  isbn: string;
  publisher: string;
  publisherBn?: string;
  publicationYear: number;
  edition?: string;
  language?: string;
  pages: number;
  format?: string;
  totalCopies: number;
  copiesAvailable: number;
  shelfLocation: string;
  status?: BookStatus;
  description: string;
  descriptionBn?: string;
  keyTopics: string[];
  tags: string[];
}

export interface IUpdateBook {
  title?: string;
  titleBn?: string;
  author?: string;
  authorBio?: string;
  category?: string;
  categoryBn?: string;
  rating?: number;
  reviewsCount?: number;
  badge?: string;
  coverImage?: string;

  isbn?: string;
  publisher?: string;
  publisherBn?: string;
  publicationYear?: number;
  edition?: string;
  language?: string;
  pages?: number;
  format?: string;

  totalCopies?: number;
  copiesAvailable?: number;
  shelfLocation?: string;
  status?: BookStatus;

  description?: string;
  descriptionBn?: string;
  keyTopics?: string[];
  tags?: string[];
}