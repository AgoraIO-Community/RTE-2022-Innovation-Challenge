export interface DBItemNorm {
    _id: string;
    createdAt?: Date;
    createdBy?: string;
}

export interface DBItemBase extends DBItemNorm {
    updatedBy?: string;
    updatedAt?: Date;
    changes?: any[];
}

export interface DBItemArchedBase<T = any> extends DBItemBase {
    data: T;
    ignoredUsers: string[];
    userId: string;
}

export interface IFileStored {
    name: string;
    userId: string;
    refId?: string;
    path?: string;
    complete: boolean;
    uploading: boolean;
    size: number;
    type: string;
    extension: string;
    hash: string;
    url?: string;
    token?: string;
    _id?: any;
    etag?: string;
    originalId?: any;
}

export enum CacheLevel {
    None,
    Temp,
    Hard,
    Soft,
}

export interface ApiLink {
    rel: string;
    method?: "get" | "post" | "put" | "delete";
    url: string;
    body?: any[];
    query?: any[];
    name?: string;
    desc?: string;
}
