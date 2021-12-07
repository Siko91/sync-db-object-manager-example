export async function wait(
  ms: number
): Promise<void> {
  return await new Promise((resolve) => setTimeout(() => resolve(), ms));
}

export async function simulateWait(
  min: number = 40,
  max: number = 200
): Promise<void> {
  const msToWait = getRandomArbitrary(min, max);
  return await wait(msToWait);
}

function getRandomArbitrary(min:number, max:number) {
  return Math.round(Math.random() * (max - min) + min);
}
