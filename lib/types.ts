import { Request } from 'express';
import { AWSError } from 'aws-sdk';

enum Locked {
    Unlocked = 1,
    Locked = 2
}

export interface IDiagram {
    id: string,
    userId: string,
	title: string,
	description: string
	tags?: string[]
	locked?: Locked,
	rootNodes: string[],
	channels: {
        name: string,
        numberId: number,
        color: string
    }[]
}

export interface IDiagramPreview {
    id: string,
    title: string,
    description: string,
    tags: string[],
    locked: Locked
}

export interface INode {
    id: string,
	parent: string,
	children: string[]
	content: string,
	comment: string,
    subComment: string,
	channel: number,
	styling?: {}
}

export interface IRequest extends Request {
    session: any
}

export interface User {
	username: string,
	id: string,
	passwordHash: string
}

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
    data?: D,
    error?: Error | AWSError,
}