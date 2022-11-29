export interface IReader<T> {
    find(item: T): Promise<T[]>
    findOne(id: string): Promise<T>
}

export interface IWriter<T> {
    create(item: T): Promise<T>
    update(id: string, item: T): Promise<T>
    delete(id: string): Promise<boolean>
}

export abstract class BaseRepository<T> implements IReader<T>, IWriter<T> {
    create(item: T): Promise<T> {
        throw new Error('Method not implemented.');
    }
    update(id: string, item: T): Promise<T> {
        throw new Error('Method not implemented.');
    }
    delete(id: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    find(item: T): Promise<T[]> {
        throw new Error('Method not implemented.');
    }
    findOne(id: string): Promise<T> {
        throw new Error('Method not implemented.');
    }
}

export interface IOwnedESReader<T> {
    find(owner: string, item: T): Promise<T[]>
    findOne(owner: string, id: string): Promise<T>
}

export interface IOwnedESWriter<T> {
    create(owner: string, item: T): Promise<T>
    update(owner: string, id: string, item: T): Promise<T>
    delete(owner: string, id: string): Promise<boolean>
}

export abstract class OwnedESIndexBaseRepository<T> implements IOwnedESReader<T>, IOwnedESWriter<T> {
    create(owner: string, item: T): Promise<T> {
        throw new Error('Method not implemented.');
    }
    update(owner: string, id: string, item: T): Promise<T> {
        throw new Error('Method not implemented.');
    }
    delete(owner: string, id: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    find(owner: string, item: T): Promise<T[]> {
        throw new Error('Method not implemented.');
    }
    findOne(owner: string, id: string): Promise<T> {
        throw new Error('Method not implemented.');
    }
}