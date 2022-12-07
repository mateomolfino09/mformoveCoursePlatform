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

export interface TopicSubmissions {
}

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

export interface User {
    id: string;
    updated_at: Date;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    twitter_username: string;
    portfolio_url: string;
    bio: string;
    location: string;
    links: Links2;
    profile_image: ProfileImage;
    instagram_username: string;
    total_collections: number;
    total_likes: number;
    total_photos: number;
    accepted_tos: boolean;
    for_hire: boolean;
    social: Social;
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

