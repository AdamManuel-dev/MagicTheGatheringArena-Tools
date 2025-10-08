import {Command} from '@oclif/core';
import {tracer} from './tracer';

export abstract class TracedCommand extends Command {
  protected abstract execute(): Promise<void>;

  async run(): Promise<void> {
    const commandId = (this.constructor as typeof Command).id ?? this.id ?? this.constructor.name;
    const stop = tracer.start(commandId, {argv: this.argv});
    try {
      await this.execute();
      stop();
    } catch (error) {
      tracer.error(commandId, error as Error);
      stop();
      throw error;
    }
  }
}
