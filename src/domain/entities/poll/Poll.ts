import { PollAlternative } from "./PollAlternative";
import { PollVisibility } from "./PollVisibility";

export class Poll {
  constructor(
    private id: string,
    private title: string,
    private alternatives: PollAlternative[],
    private startDate: Date,
    private visibility: PollVisibility,
    private description?: string | null,
    private endDate?: Date | null,
    private expectedVotes?: number | null,
  ) { }

  getId() {
    return this.id
  }
}
