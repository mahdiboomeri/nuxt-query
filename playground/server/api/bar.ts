export default defineEventHandler(() => {
  // await new Promise((resolve) => setTimeout(resolve, 5 * 1000))
  return {
    bar: 'Hello there',
  }
})
