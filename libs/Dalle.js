import { Dalle as OrigDalle, DalleError } from 'dalle-node'
import got from 'got';

export class Dalle extends OrigDalle {

  constructor(bearerToken) {
    super(bearerToken)
  }

  async generate(prompt, option = { batch_size: 4 }) {
    console.log('[DALLE] generate:', prompt)
    return new Promise(async (resolve, reject) => {
      try {
        let task = await got.post(`${this.url}/tasks`, {
          json: {
            task_type: "text2im",
            prompt: {
              caption: prompt,
              batch_size: option.batch_size,
            },
          },
          headers: {
            Authorization: `Bearer ${ this.bearerToken }`
          }
        }).json();
    
        const refreshIntervalId = setInterval(async () => {
          task = await this.getTask(task.id)
    
          switch (task.status) {
            case "succeeded":
              clearInterval(refreshIntervalId);
              resolve(task.generations)
            case "rejected":
              clearInterval(refreshIntervalId);
              reject(new DalleError(task.status_information))
            case "pending":
          }
        }, 2000);
    
        return task
      } catch (err) {
        reject(err)
      }
    })
  }
}
