// Result type
export enum Status {
    Success = 1, // Succeeded as intended with expected data
    Failed = 2 // An error occurred with an exception
}

export enum GetUserStatus {
    Success = 1,
    UsernameNotFound = 3,
    Failed = 2
}

export enum LoginStatus {
    Success = 1,
    UsernameOrPasswordIncorrect = 3,
    Failed = 2
}

export enum AddUserStatus {
    Success = 1,
    UsernameExists = 3,
    Failed = 2
}

export interface DbResults<S, D> {
    status: S,
    data?: D
}

export enum Pages {
    Login,
    Home,
    Diagram
}

export enum LockedStatus {
    Unlocked,
    Partial,
    Full
}

export interface TagList {
    [tagName: string]: {
        locked: LockedStatus,
        diagrams: {
            [id: string]: boolean
        }
    }
}

export interface IDiagramPreview {
    id: string,
    title: string,
    description: string,
    locked: LockedStatus
}