import React, { useState, useEffect } from "react";
import classes from "./App.module.css";

import axios from "axios";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";
import LinearProgress from "@material-ui/core/LinearProgress";
import SearchIcon from "@material-ui/icons/Search";

const App = () => {
  const [movieDetails, setMovieDetails] = useState();
  const [nominationDetailsLS, setNominationDetailsLS] = useState();
  const [errorState, setErrorState] = useState(false);
  const [nominationDisplay, setNominationDisplay] = useState(false);
  const [search, setSearch] = useState("");
  const [searchForClick, setSearchForClick] = useState("");
  const [loader, setLoader] = useState(false);
  let [count, setCount] = useState(0);
  const [nominationArray, setNominationArray] = useState([]);

  const getMoviesHandler = async (searchValue) => {
    try {
      const response = await axios.get(
        "https://omdbapi.com/?apikey=e67a02f0&type=movie&s=" + searchValue
      );
      setLoader(true);
      setTimeout(function () {
        setLoader(false);
        setMovieDetails(response.data.Search);
      }, 700);
    } catch (error) {
      console.error("Data from API:", error);
    }
  };

  useEffect(() => {
    const retrievedObject = JSON.parse(
      localStorage.getItem("nominationDetailsLS")
    );
    if (retrievedObject) {
      setNominationDetailsLS(retrievedObject);
      setNominationArray(retrievedObject);
    }
    const retrievedCount = JSON.parse(localStorage.getItem("count"));
    setCount(retrievedCount);
    if (retrievedObject) {
      retrievedObject.forEach((eachMovie) => {
        if (eachMovie.Nominated) {
          setNominationDisplay(true);
        }
      });
    }
  }, [movieDetails]);

  return (
    <React.Fragment>
      <div className={classes.groupCountainer}>
        <h1 className={classes.title}>The Shoppies</h1>
        <div className={classes.container}>
          <Grid className={classes.gridPaddingSearch} item xs={12}>
            <TextField
              className={classes.searchbar}
              id="search-by-movie-name"
              name="search"
              label="Search by movie name"
              variant="outlined"
              onKeyUp={(event) => {
                setSearchForClick(event.target.value);
                if (event.keyCode === 13) {
                  getMoviesHandler(event.target.value);
                  setSearch(event.target.value);
                }
              }}
            />
            <Button
              className={classes.searchButton}
              variant="outlined"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={() => {
                if (searchForClick) {
                  getMoviesHandler(searchForClick);
                  setTimeout(function () {
                    setSearch(searchForClick);
                  }, 700);
                }
              }}
            >
              Search
            </Button>
          </Grid>
        </div>
        <Grid className={classes.gridPadding} item xs={12}>
          {errorState && (
            <Alert variant="outlined" severity="error">
              You have nominated 5 movies. To nominate more movies, you will
              have to remove a nomination.
            </Alert>
          )}
          {loader && <LinearProgress color="primary" />}
        </Grid>
        <div className={classes.container}>
          <Grid className={classes.gridPadding} item xs={8}>
            {movieDetails && (
              <div>
                <Paper className={classes.paperStyles}>
                  {search ? (
                    <h3 className={classes.title}>Results for "{search}":</h3>
                  ) : (
                    <h3 className={classes.title}>Results:</h3>
                  )}
                  {movieDetails.map((movie) => (
                    <div
                      key={Math.random()}
                      className={classes.movieDetailsContainer}
                    >
                      <div className={classes.movieImageContainer}>
                        {movie.Poster !== "N/A" && (
                          <img
                            src={movie.Poster}
                            className={classes.movieImage}
                            alt="Avatar"
                          ></img>
                        )}
                      </div>
                      <div className={classes.titleContainer}>
                        <h2 className={classes.movieTitle}>
                          {movie.Title} ({movie.Year})
                        </h2>
                      </div>
                      <div className={classes.buttonContainer}>
                        {!movie.Nominated || movie.Nominated === false ? (
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              const updatedMovies = movieDetails.map(
                                (eachMovie) => {
                                  if (
                                    eachMovie.imdbID === movie.imdbID &&
                                    count < 5
                                  ) {
                                    const updatedMovie = {
                                      ...eachMovie,
                                      Nominated: true,
                                    };
                                    nominationArray.push(updatedMovie);
                                    setCount(count++);
                                    setNominationDisplay(true);
                                    return updatedMovie;
                                  } else if (count >= 5) {
                                    setErrorState(true);
                                    setTimeout(function () {
                                      setErrorState(false);
                                    }, 4000);
                                    return eachMovie;
                                  } else {
                                    return eachMovie;
                                  }
                                }
                              );
                              setMovieDetails(updatedMovies);
                              localStorage.setItem(
                                "nominationDetailsLS",
                                JSON.stringify(nominationArray)
                              );
                              localStorage.setItem(
                                "count",
                                JSON.stringify(count)
                              );
                            }}
                          >
                            Nominate
                          </Button>
                        ) : (
                          <Button variant="outlined" disabled>
                            Nominated
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </Paper>
              </div>
            )}
          </Grid>
          <Grid className={classes.gridPadding} item xs={4}>
            {nominationDisplay === true && nominationDetailsLS && (
              <Paper className={classes.paperStyles}>
                <h3 className={classes.title}>Nominations:</h3>
                {nominationDetailsLS.map((movie) => {
                  if (movie.Nominated && movie.Nominated === true)
                    return (
                      <div
                        key={Math.random()}
                        className={classes.nominationsContainer}
                      >
                        <div className={classes.nominationTitleContainer}>
                          <h4>{movie.Title}</h4>
                        </div>
                        <div className={classes.titleContainer}>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                              const updatedMovies = nominationArray.filter(
                                (eachMovie) => {
                                  if (eachMovie.imdbID !== movie.imdbID) {
                                    return eachMovie;
                                  } else {
                                    return null;
                                  }
                                }
                              );

                              const updatedMovieList = movieDetails.map(
                                (eachMovie) => {
                                  if (eachMovie.imdbID === movie.imdbID) {
                                    const updatedMovie = {
                                      ...eachMovie,
                                      Nominated: false,
                                    };
                                    return updatedMovie;
                                  } else {
                                    return eachMovie;
                                  }
                                }
                              );

                              nominationArray.forEach((eachMovie) => {
                                if (
                                  eachMovie.imdbID === movie.imdbID &&
                                  eachMovie.Nominated === true
                                ) {
                                  setCount(count--);
                                  if (count <= 0) {
                                    setNominationDisplay(false);
                                  }
                                }
                              });

                              setMovieDetails(updatedMovieList);
                              setNominationArray(updatedMovies);
                              localStorage.setItem(
                                "nominationDetailsLS",
                                JSON.stringify(updatedMovies)
                              );
                              localStorage.setItem(
                                "count",
                                JSON.stringify(count)
                              );
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  else {
                    return null;
                  }
                })}
              </Paper>
            )}
          </Grid>
        </div>
      </div>
    </React.Fragment>
  );
};

export default App;
