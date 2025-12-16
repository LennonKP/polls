import { PollAlternative } from "./PollAlternative";
import { PollVisibility } from "./PollVisibility";
import { PollStatus } from "./PollStatus";

export class Poll {
  constructor(
    private id: string,
    private title: string,
    private alternatives: PollAlternative[],
    private startDate: Date,
    private visibility: PollVisibility,
    private createdById: string,
    private status: PollStatus = "open",
    private description: string | null,
    private endDate: Date | null,
    private expectedVotes: number | null,
    private categories: string[] | null
  ) { }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getAlternatives(): PollAlternative[] {
    return this.alternatives;
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date | null {
    return this.endDate;
  }

  getVisibility(): PollVisibility {
    return this.visibility;
  }

  getCreatedById(): string {
    return this.createdById;
  }

  getStatus(): PollStatus {
    return this.status;
  }

  getExpectedVotes(): number | null {
    return this.expectedVotes;
  }

  getCategories(): string[] | null {
    return this.categories;
  }

  setStatus(status: PollStatus): void {
    this.status = status;
  }

  setEndDate(endDate: Date): void {
    this.endDate = endDate;
  }

  setExpectedVotes(expectedVotes: number): void {
    this.expectedVotes = expectedVotes;
  }

  isOpen(): boolean {
    return this.status === "open";
  }

  canVote(now: Date = new Date()): boolean {
    if (this.status !== "open") return false;
    if (now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    return true;
  }
}

