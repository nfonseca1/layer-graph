import {Request} from 'express';

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