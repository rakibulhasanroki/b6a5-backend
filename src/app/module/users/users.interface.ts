export interface IUpdateUserPayload {
  name?: string;
  phoneNumber?: string;
  bio?: string;
  image?: string;
}

export interface IGetUsersQuery {
  page: number;
  limit: number;
}
