import { Collection } from "./collections.js";
import * as http from './http.js';
import logUpdate from 'log-update';

const progressFrames = ['-', '\\', '|', '/'];
  

export class Creation {
  
  constructor(creation) {
    Object.assign(this, creation);
    this.baseRoute = `/creation/${this._id}`;
  }

  react = async function(reaction) {
    const result = await http.post(`${this.baseRoute}/react`, {
      reaction: reaction,
      unreact: false
    });
    return result;
  }

  unreact = async function(reaction) {
    const result = await http.post(`${this.baseRoute}/react`, {
      reaction: reaction,
      unreact: true
    });
    return result;
  }

  getRecreations = async function() {
    const result = await http.get(`${this.baseRoute}/recreations`);
    return result.map(creation => new Creation(creation));
  }

  getCollections = async function() {
    const result = await http.get(`${this.baseRoute}/collections`);
    return result.collections.map(collection => new Collection(collection.collectionId));
  }

  getReactions = async function(reactions) {
    const filter = reactions ? { reactions: reactions } : {};
    const result = await http.post(`${this.baseRoute}/reactions`, filter);
    return result.reactions;
  }

};

export async function getCreations(filter) {
  filter = filter || {};
  const result = await http.post("/creations", filter);
  return result.creations.map(creation => new Creation(creation));
};

export async function getCreation(creationId) {
  if (!creationId) {
    throw new Error("Creation ID is required");
  }
  const result = await http.get(`/creation/${creationId}`);
  return new Creation(result.creation);
};

export async function startTask(generatorName, config, metadata=null, generatorVersion=null) {
  const request = {
    generatorName: generatorName,
    config: config,
    metadata: metadata,
    generatorVersion: generatorVersion,
  };
  const result = await http.post('/user/create', request);
  return result;
};

export async function getTasks(filter) {
  filter = filter || {};
  const result = await http.post('/user/tasks', filter);
  return result;
};

export async function getTaskStatus(taskId) {
  const data = { taskIds: [taskId] };
  const response = await http.post('/user/tasks', data);
  if (!response.tasks) {
    return { status: "failed", error: `Task ${taskId} not found` };
  }
  const task = response.tasks[0];
  const { status } = task;
  return { status, task };
};

export async function create(generatorName, config, metadata=null, generatorVersion=null, pollingInterval=2000) {
  let result = await this.startTask(generatorName, config, metadata, generatorVersion);
  if (result.error) {
    return result;
  }
  const taskId = result.taskId;
  console.log(`Starting task ${taskId}...`)
  let response = await this.getTaskStatus(taskId);
  let idx = 0;
  while (
    response.status == "pending" ||
    response.status == "starting" ||
    response.status == "running"
  ) {
    await new Promise((r) => setTimeout(r, pollingInterval));
    response = await this.getTaskStatus(taskId);
    logUpdate(`${progressFrames[idx++ % progressFrames.length]} Task: ${taskId} \tStatus: ${response.status} \tProgress: ${response.task?.progress}`);
  }
  if (response.task && response.task.creation) {
    const creation = getCreation(response.task.creation);
    return creation;
  };
  return response;
};

