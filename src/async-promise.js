
/**

  Execute a func asynchronously and return promise to receive the result. 
  The function does not expect to have a callback parameter.

  @arg {function} func - non-callback function

  @example asyncPromise(myfunction)
*/
module.exports = func => (
    (...args) => (
      new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(func(...args))
          } catch(err) {
            reject(err)
          }
        })
      })
    )
  )
  