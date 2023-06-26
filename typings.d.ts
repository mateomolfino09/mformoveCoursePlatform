export interface Urls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
  small_s3: string;
}

export interface Links {
  self: string;
  html: string;
  download: string;
  download_location: string;
}

export interface TopicSubmissions {}

export interface Links2 {
  self: string;
  html: string;
  photos: string;
  likes: string;
  portfolio: string;
  following: string;
  followers: string;
}

export interface ProfileImage {
  small: string;
  medium: string;
  large: string;
}

export interface Social {
  instagram_username: string;
  portfolio_url: string;
  twitter_username: string;
  paypal_email?: any;
}

export interface Images {
  id: string;
  created_at: Date;
  updated_at: Date;
  promoted_at: Date;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description?: any;
  alt_description: string;
  urls: Urls;
  links: Links;
  likes: number;
  liked_by_user: boolean;
  current_user_collections: any[];
  sponsorship?: any;
  topic_submissions: TopicSubmissions;
  user: User;
}

export interface Origin {
  name: string;
  url: string;
}

export interface Location {
  name: string;
  url: string;
}

export interface Ricks {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: Origin;
  location: Location;
  image: string;
  episode: string[];
  url: string;
  created: Date;
}

export interface Default {
  url: string;
  width: number;
  height: number;
}

export interface Medium {
  url: string;
  width: number;
  height: number;
}

export interface High {
  url: string;
  width: number;
  height: number;
}

export interface Standard {
  url: string;
  width: number;
  height: number;
}

export interface Maxres {
  url: string;
  width: number;
  height: number;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface Thumbnails {
  default: Default;
  medium: Medium;
  high: High;
  standard: Standard;
  maxres: Maxres;
}

export interface ResourceId {
  kind: string;
  videoId: string;
}

export interface Snippet {
  publishedAt: Date;
  channelId: string;
  title: string;
  description: string;
  thumbnails: Thumbnails;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: ResourceId;
  videoOwnerChannelTitle: string;
  videoOwnerChannelId: string;
}

export interface Item {
  kind: string;
  etag: string;
  id: string;
  snippet: Snippet;
}

export interface Playlist {
  kind: string;
  etag: string;
  items: Item[];
  pageInfo: PageInfo;
}

export interface Courses {
  name: string;
  playlistId: string;
  imageUrl: string;
}

export interface ClassesUser {
  actualTime: number;
}

export interface Notification {
  title: string;
  message: string;
  status: string;
  read: boolean;
  link: string;
}

export interface CourseUser {
  course: string;
  like: Boolean;
  inList: Boolean;
  actualChapter: number;
  actualTime: number;
  purchased: Boolean;
  classes: [ClassesUser];
}

export interface Modules {
  quantity: number;
  breakPoints: [number];
  titles: [string];
}

export interface User {
  id: number;
  _id: number;
  name: string;
  email: string;
  gender: string;
  country: string;
  password: string;
  createdAt: string;
  rol: string;
  emailToken: string;
  courses: CourseUser[];
  admin: AdminUser;
  notifications: Notification[];
}

export interface CoursesDB {
  _id: string;
  id: number;
  createdAt: string;
  udpatedAt: string;
  description: string;
  playlist_code: string;
  image_url: string;
  name: string;
  dbLikes: string;
  likes: number;
  users: User[];
  classes: ClassesDB[];
  price: number;
  currency: string;
  created_by: User;
  index: number;
  classesQuantity: number;
  isOpen: boolean;
  modules: Modules;
}

export interface ClassesDB {
  _id: string;
  id: number;
  name: string;
  createdAt: string;
  class_code: string;
  image_url: string;
  likes: number;
  totalTime: number;
  course: CoursesDB;
  atachedFiles: [Archive]
}

export interface Answer {
  answerAdmin: User;
  answeredAt: string;
  answer: string;
}
export interface Question {
  id: number;
  question: string;
  answers: Answer[];
  user: User;
  answerAdmin: User;
  class: ClassesDB;
  createdAt: string;
  hasAnswer: boolean;
}

export interface Bill {
  payment_id: Number;
  merchant_order_id: String;
  preference_id: String;
  collection_id: String;
  payment_type: String;
  createdAt: Date;
  status: String;
  processing_mode: String;
  course: CoursesDB;
  user: User;
}

export interface Archive {
  id: Number
  document_url: String
  public_id: String
  name: String
}

