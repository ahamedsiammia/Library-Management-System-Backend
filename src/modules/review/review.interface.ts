export interface ICreateReview {
  rating: number;
  comment?: string;
  bookId: string
}

export interface IUpdateReview {
  reviewId : string,
  rating : number,
  comment : string
}