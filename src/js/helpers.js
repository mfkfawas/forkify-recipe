import { async } from 'regenerator-runtime'
import { TIMEOUT_SEC } from './config'

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`))
    }, s * 1000)
  })
}

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url)
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
    const data = await res.json()
    if (!res.ok) throw new Error(`${data.message} (${res.status})`)
    //console.log(res, data)
    return data
  } catch (err) {
    throw err
  }
}

// export const getJSON = async (url) => {
//   try {
//     const fetchPro = fetch(url)
//     const res = await Promise.race(fetchPro, timeout(TIMEOUT_SEC)])
//     const data = await res.json()
//     if (!res.ok) throw new Error(`${data.message} (${res.status})`)
//     //console.log(res, data)
//     return data
//   } catch (err) {
//the promise that being returned is now rejected, then we can handle it wherever
//getJSON() is called. Otherwise(if we didnt use throw) it will be recieved there as
//a resolved promise.
//When one async fn call another async fn it is essential to rethrow the error,
//Otherwise(if we didnt use throw) it will be recieved there as
//a resolved promise.
//And we dont want handle the error here but we want to handle it at wherever this
//getJSON() is called bcz otherwise in console it shows error happened at helpers.js
//file, but we want to see the line no and file at where the getJSON() is called. So
//we rethrown error from here
//     throw err
//   }
// }

// export const sendJSON = async (url, uploadData) => {
//   try {
//     const fetchPro = fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(uploadData),
//     })

//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
//     const data = await res.json()
//     if (!res.ok) throw new Error(`${data.message} (${res.status})`)
//     //console.log(res, data)
//     return data
//   } catch (err) {
//     throw err
//   }
// }
