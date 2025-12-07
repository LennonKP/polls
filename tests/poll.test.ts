import { expect, test } from 'bun:test';

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

test('should be possible to create a poll', () => {
  const pollRepository = new MemoryPollRepository();
  const useCase = new CreatePollUseCase()
})
