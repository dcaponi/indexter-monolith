/* 
TODO - There should be a workstream service that tracks the steps in various workstreams to
coordinate and track events that happen throughout the services
*/

enum WorkStreamType { Index }

type IndexWorkStream = {
    id?: string | null;
    user_id: string;
    type: WorkStreamType;
    started_at?: Date | null;
    finished_at?: Date | null;
}

enum IndexStepType { Fetch, Store }

enum StepState { Success, Fail }

type IndexStep = {
    id?: string | null;
    workstream_id: string;
    state: StepState;
    type: IndexStepType;
    started_at?: Date | null;
    finished_at?: Date | null;
}

export {
    IndexStep,
    IndexWorkStream
}