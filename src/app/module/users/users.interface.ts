export interface IUpdateUserPayload {
  name?: string;
  phoneNumber?: string;
  bio?: string;
  image?: string;
}

export interface IGetUsersQuery {
  page: number;
  limit: number;

  search?: string;
  role?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
