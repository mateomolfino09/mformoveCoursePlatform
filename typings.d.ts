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
  titles: [string] | [];
}


export interface ProductModules {
  name: string;
  id: number;
  description: string
}

export interface FreeSubscription {
  email: string;
  createdAt: string;
  active: boolean;
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
  classesSeen: IndividualClass[];
  isMember: boolean
  subscription: any
  freeSubscription: FreeSubscription;
  isVip: boolean;
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
  course: CoursesDB | null;
  atachedFiles: [Archive]
  links: [Link]
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
  answerAdmin: User | null; // Permite valores nulos;
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
  document_url: string
  public_id: string
  name: string,
  format: string
}

export interface Link {
  id: number
  link_url: string
}

export interface questionExam {
  id: number,
  question: string,
  answers: [],
  correctAnswerIndex: number
}

export interface Exam {
  id: number,
  quantityOfQuestions: number,
  approvalMin: number,
  class: ClassesDB | null
  questions: [questionExam],
}

export interface ValuesFilters {
  id: number;
  value: string
  label: string
  description: string
}

export interface ClassTypes {
  _id: string;
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  type: string 
  values: [ValuesFilters]
}

export interface Tags {
  id: number,
  title: string,

}

export interface IndividualClass {
  _id: string;
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  image_url: string;
  level: number;
  totalTime: number;
  seconds: number;
  minutes: number;
  hours: number;
  type: string;
  isFree: boolean
  image_base_link: string
  image_mini_base_link: string
  html: string
  link: string
  linkId: string
  new: boolean
  links: [Link]
  atachedFiles: [Archive]
  tags: [Tags]

}

export interface Payment {
  amount: number
  currency: string
  country: string
  order_id: string
  payer: Payer
  description: string
  success_url: string
  back_url: string
  notification_url: string
  expiration_type: string
  expiration_value: number

}

export interface Payer {
  id: string
  name: string
  email: string
  phone: string
  document_type: string
  user_reference: string
  address: Address
}

export interface Address {
  state: string
  city: string
  zip_code: string
  full_address: string
}

export interface Plan {
  id: string
  _id: string;
  merchant_id: string
  name: string
  description: string
  amount: number
  currency: string
  country: string
  frequency_type: string
  frequency_value: number
  frequency_label: string
  active: boolean
  plan_token: string
  back_url: string
  notification_url: string
  success_url: string
  error_url: string
  createdAt: string;
}

export interface ClassesProduct {
  _id: string;
  id: number;
  name: string;
  createdAt: string;
  class_code: string;
  image_url: string;
  video_url: string;
  module: number
  likes: number;
  totalTime: number;
  course: CoursesDB;
  atachedFiles: [Archive]
  link: Link
}

export interface FrequentQuestion {
  id: number;
  question: string;
  answer: string;
}

export interface ProductDB {
  _id: string;
  id: number;
  createdAt: string;
  // udpatedAt: string;
  description: string;
  longDescription: string;

  image_url: string;
  intro_video_url: string

  url: string;
  name: string;
  phraseName: string;

  frequentQuestions: FrequentQuestion[]
  
  dbLikes: string;
  likes: number;
  users: User[];
  classes: ClassesProduct[];
  price: number;
  currency: string;
  created_by: User;
  index: number;
  classesQuantity: number;
  isOpen: boolean;
  modules: ProductModules[];
  productType: string
}

export interface FreeProduct {
  _id: string;
  id: number;
  createdAt: string;
  // udpatedAt: string;
  description: string;
  image_url: string;
  url: string;
  name: string;
  created_by: User;
  vimeoId: number
}

export interface FAQ {
  _id: string;
  id: number;
  question:string;
  answer:string;
}