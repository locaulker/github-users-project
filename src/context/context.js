import React, { useState, useEffect } from "react"
import mockUser from "./mockData.js/mockUser"
import mockRepos from "./mockData.js/mockRepos"
import mockFollowers from "./mockData.js/mockFollowers"
import axios from "axios"

const rootUrl = "https://api.github.com"

// create context - to provide access to "Provider" and "Consumer" Components
const GithubContext = React.createContext()

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser)
  const [repos, setRepos] = useState(mockRepos)
  const [followers, setFollowers] = useState(mockFollowers)

  // requests, loading
  const [requests, setRequests] = useState(0)
  const [loading, setLoading] = useState(false)

  // errors: no user or no remaining requests
  const [error, setError] = useState({ show: false, msg: "" })

  // executing a search
  const searchGithubUser = async user => {
    toggleError()
    // setLoading(true)
    const response = await axios(`${rootUrl}/users/${user}`).catch(err =>
      console.log(err)
    )

    if (response) {
      setGithubUser(response.data)
      // more logic here
    } else {
      toggleError(true, "Sorry! No user found with that username!")
    }
  }

  // check rate limit
  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data

        setRequests(remaining)
        if (remaining === 0) {
          toggleError(
            true,
            "Oops! You have exceeded your hourly request limit!"
          )
        }
      })
      .catch(err => console.log(err))
  }

  // error checking
  function toggleError(show = false, msg = "") {
    setError({ show, msg })
  }

  useEffect(checkRequests, [])

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
      }}
    >
      {children}
    </GithubContext.Provider>
  )
}

export { GithubProvider, GithubContext }
