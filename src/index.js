/* eslint-disable no-script-url */
import "./index.css";
import React from "react";
import ReactDOM from "react-dom";

const Increment = props => {
  return (
    <button
      className='session-increment btn increment ripple ripple-primary'
      onClick={props.handleIncrement}
      id={props.id}>
      <i className=' fas fa-plus'></i>
    </button>
  );
};
const Decrement = props => {
  return (
    <button
      className='session-decrement btn decrement ripple ripple-primary'
      onClick={props.handleDecrement}
      id={props.id}>
      <i className='fas fa-minus'></i>
    </button>
  );
};

const Session = props => {
  return (
    <div className='session-container head-container'>
      <div className='session-label head-label'>Session Time</div>
      <div className='session-controls head-controls'>
        {props.decrement}
        <div className='session-length length'>{sessionTemp}</div>
        {props.increment}
      </div>
    </div>
  );
};

const Break = props => {
  return (
    <div className='break-container  head-container'>
      <div className='break-label head-label'>Break Time</div>
      <div className='break-controls head-controls'>
        {props.decrement}
        <div className='break-length length'>{breakTemp}</div>
        {props.increment}
      </div>
    </div>
  );
};

const Timer = props => {
  let label = "",
    icon;
  switch (props.timerState) {
    case "init":
      label = "Ready?";
      icon = <i class='fas fa-flag-checkered'></i>;
      break;
    case "session":
      label = "Get to work!";
      icon = <i class='fas fa-running'></i>;
      break;
    case "break":
      label = "Take a break";
      icon = <i class='fas fa-coffee'></i>;
      break;
    case "paused":
      label = "Paused";
      icon = <i class='fas fa-pause'></i>;
      break;
    case "complete":
      label = "Complete!";
      icon = <i class='fas fa-glass-cheers'></i>;
      break;
    default:
      label = "Ready?";
      icon = <i class='fas fa-flag-checkered'></i>;
  }

  return (
    <div
      className='timer-outer-circle'
      style={{color: props.whichTimer === "session" ? "#5dcbff" : "#ff7597"}}>
      <svg
        id='timer-circle'
        className='timer-circle progress'
        viewBox='0 0 300 300'>
        <circle
          cx='150'
          cy='150'
          r='146'
          fill='none'
          stroke='transparent'
          stroke-width='8'
        />
        {props.restartAnimation ? (
          <div></div>
        ) : (
          <circle
            id='progress-bar'
            className='progress__value'
            cx='150'
            cy='150'
            r='146'
            fill='none'
            stroke={props.whichTimer === "session" ? "#5dcbff" : "#ff7597"}
            stroke-width='8'
            style={{
              animation: props.restartAnimation
                ? ""
                : `progress linear ${props.duration}s infinite`,
              animationPlayState: props.playState
            }}
          />
        )}
      </svg>
      <div className='timer-label label'>
        {props.taskSubmit !== "" && props.timerState === "session"
          ? props.taskSubmit
          : label}
      </div>
      <div className='time-left' style={{color: props.blink}}>
        {props.minutes < 10 ? "0" + props.minutes : props.minutes}:
        {props.seconds < 10 ? "0" + props.seconds : props.seconds}
      </div>
      <div className='timer-icon'>{icon}</div>
    </div>
  );
};

const Controls = props => {
  let playIcon, muteIcon;
  !props.init || props.isPaused || props.timerState === "complete"
    ? (playIcon = <i className='fas fa-play'></i>)
    : (playIcon = <i class='fas fa-pause'></i>);

  !props.isMuted
    ? (muteIcon = <i className='fas fa-volume-up'></i>)
    : (muteIcon = <i class='fas fa-volume-mute'></i>);

  return (
    <div className='footer-controls'>
      <button
        className='start_stop btn btn-control ripple ripple-secondary'
        onClick={props.handleTimerState}>
        {playIcon}
      </button>
      <button
        className='mute_unmute btn btn-control ripple ripple-secondary'
        onClick={props.handleMute}>
        {muteIcon}
      </button>
      <button
        className='reset btn btn-control ripple ripple-secondary'
        onClick={props.handleReset}>
        <i className='fas fa-undo-alt'></i>
      </button>
    </div>
  );
};

const AddTask = props => {
  return (
    <div className='input-container'>
      <form
        className='footer-form'
        action='javascript:void(0);'
        method='post'
        onSubmit={props.handleSubmit}>
        <input
          tabIndex='0'
          id='task-input'
          className='task-input'
          type='text'
          maxLength='30'
          onChange={props.handleChange}
          value={props.taskInput}
          placeholder='Add task here...'
          style={{border: props.isMaxLength ? "2px solid #cf6679" : ""}}
        />
        <button
          id='add-task'
          className='add-task btn ripple ripple-primary'
          type='submit'>
          Add Task
        </button>
      </form>
      <p
        className='task-output'
        style={{color: props.isMaxLength ? "#cf6679" : ""}}>
        {props.isMaxLength ? (
          <i className='max-chars fas fa-exclamation-circle'></i>
        ) : props.taskSubmit !== "" ? (
          "TASK: " + props.taskSubmit
        ) : (
          ""
        )}
      </p>
    </div>
  );
};
let beep;
const Audio = props => {
  beep = document.getElementById("beep");
  return (
    <audio
      id='beep'
      preload='auto'
      muted={props.isMuted}
      src='https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav'
    />
  );
};

let sessionId, breakId, blinkId, sessionTemp, breakTemp, target;

class Pomodoro extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();

    this.handleIncrement = this.handleIncrement.bind(this);
    this.handleDecrement = this.handleDecrement.bind(this);
    this.handleTimerState = this.handleTimerState.bind(this);
    this.handleMute = this.handleMute.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.timerLogic = this.timerLogic.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.blinkTimer = this.blinkTimer.bind(this);
    this.onClickOutside = this.onClickOutside.bind(this);
  }

  getInitialState() {
    return {
      session: 25,
      break: 5,
      minutes: 0,
      seconds: 0,
      elapsed: 0,
      totalSecs: 0,
      init: false,
      isStarted: false,
      isPaused: false,
      isMuted: false,
      timerState: "init",
      whichTimer: "session",
      taskInput: "",
      taskSubmit: "",
      blink: "inherit",
      isMaxLength: false,
      restartAnimation: false,
      duration: 0,
      playState: "paused"
    };
  }

  componentWillMount() {
    clearInterval(sessionId);
    clearInterval(breakId);
    clearInterval(blinkId);
    sessionId = null;
    breakId = null;
    blinkId = null;
    this.setState({
      minutes: this.state.session,
      seconds: 0,
      duration: this.state.session * 60
    });
    target = null;
    sessionTemp = this.state.session;
    breakTemp = this.state.break;
  }

  onClickOutside(e) {
    if (e.target.id !== "add-task") {
      this.setState({
        taskInput: "",
        taskSubmit: "",
        isMaxLength: false
      });
    }
  }

  componentDidUpdate() {
    if (
      this.state.timerState === "session" &&
      parseInt(this.state.elapsed) === this.state.session * 60 - 1
    ) {
      beep.play();
    } else {
      beep.pause();
      beep.currentTime = 0;
    }
    if (this.state.timerState === "complete") {
      beep.play();
    }

    if (this.state.isMaxLength) {
      document.addEventListener("click", this.onClickOutside);
    } else {
      document.removeEventListener("click", this.onClickOutside);
    }
  }

  restartAnimation(duration) {
    this.setState(
      {
        restartAnimation: true
      },
      () => {
        requestAnimationFrame(() => {
          this.setState({
            duration: duration,
            restartAnimation: false
          });
        });
      }
    );
  }

  handleChange(e) {
    e.preventDefault();
    if (this.state.timerState === "complete") {
      this.handleReset();
    }
    this.setState(
      {
        taskInput: e.target.value
      },
      () => {
        this.setState(
          {
            isMaxLength:
              this.state.taskInput.length >=
              document.getElementById("task-input").maxLength
                ? true
                : false
          },
          () => {
            if (this.state.isMaxLength) {
              this.setState({
                taskSubmit:
                  "Must be " +
                  document.getElementById("task-input").maxLength +
                  " characters or less!"
              });
            }
          }
        );
      }
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.timerState === "complete") {
      this.handleReset();
    }
    this.setState({
      taskSubmit: this.state.taskInput,
      taskInput: "",
      isMaxLength: false
    });
  }

  handleIncrement(e) {
    target = e.currentTarget;
    if (this.state.timerState === "complete") {
      this.handleReset();
    } else if (!this.state.isStarted) {
      clearInterval(sessionId);
      clearInterval(breakId);
      sessionId = null;
      breakId = null;
      this.setState(
        {
          session:
            e.currentTarget.id === "session-inc" && this.state.session < 60
              ? this.state.session + 1
              : this.state.session,
          break:
            e.currentTarget.id === "break-inc" && this.state.break < 60
              ? this.state.break + 1
              : this.state.break
        },
        () => {
          this.setState({
            minutes: this.state.session,
            seconds: 0
          });
          this.restartAnimation(
            this.state.whichTimer === "session"
              ? this.state.session * 60
              : this.state.break * 60
          );
          sessionTemp =
            target.id === "session-inc" && sessionTemp < 60
              ? sessionTemp + 1
              : sessionTemp;
          breakTemp =
            target.id === "break-inc" && breakTemp < 60
              ? breakTemp + 1
              : breakTemp;
        }
      );
    }
  }

  handleDecrement(e) {
    target = e.currentTarget;
    if (this.state.timerState === "complete") {
      this.handleReset();
    } else if (!this.state.isStarted) {
      clearInterval(sessionId);
      clearInterval(breakId);
      sessionId = null;
      breakId = null;
      this.setState(
        {
          session:
            e.currentTarget.id === "session-dec" && this.state.session > 1
              ? this.state.session - 1
              : this.state.session,
          break:
            e.currentTarget.id === "break-dec" && this.state.break > 1
              ? this.state.break - 1
              : this.state.break
        },
        () => {
          this.setState({
            minutes: this.state.session,
            seconds: 0
          });
          this.restartAnimation(
            this.state.whichTimer === "session"
              ? this.state.session * 60
              : this.state.break * 60
          );
          sessionTemp =
            target.id === "session-dec" && sessionTemp > 1
              ? sessionTemp - 1
              : sessionTemp;
          breakTemp =
            target.id === "break-dec" && breakTemp > 1
              ? breakTemp - 1
              : breakTemp;
        }
      );
    }
  }

  timerLogic = (sessionMins, breakMins) => {
    let start = new Date().getTime(),
      min,
      sec,
      sessionSecs = sessionMins * 60,
      breakSecs = breakMins * 60;
    const sessionTimer = () => {
      this.setState({
        elapsed: (new Date().getTime() - start) / 1000
      });

      min = Math.floor((sessionSecs - this.state.elapsed) / 60);
      sec = Math.floor((sessionSecs - this.state.elapsed) % 60);

      this.setState({
        minutes: min,
        seconds: sec,
        totalSecs: sessionSecs - this.state.elapsed
      });

      if (this.state.totalSecs < 0.1) {
        clearInterval(sessionId);
        sessionId = null;
        start = new Date().getTime();
        this.setState({
          timerState: "break",
          whichTimer: "break"
        });
        this.restartAnimation(this.state.break * 60);
        breakId = setInterval(breakTimer, 100);
      }
    };
    const breakTimer = () => {
      this.setState({
        elapsed: (new Date().getTime() - start) / 1000
      });
      min = Math.floor((breakSecs - this.state.elapsed) / 60);
      sec = Math.floor((breakSecs - this.state.elapsed) % 60);

      this.setState({
        minutes: min,
        seconds: sec,
        totalSecs: breakSecs - this.state.elapsed
      });
      if (this.state.totalSecs <= 0) {
        clearInterval(breakId);
        breakId = null;
        this.setState({
          minutes: 0,
          seconds: 0,
          timerState: "complete",
          restartAnimation: true
        });
      }
    };
    if (this.state.whichTimer === "session") {
      sessionId = setInterval(sessionTimer, 100);
    } else {
      breakId = setInterval(breakTimer, 100);
    }
  };

  blinkTimer() {
    this.state.blink === "inherit"
      ? this.setState({blink: "transparent"})
      : this.setState({blink: "inherit"});
  }

  handleTimerState() {
    if (this.state.timerState === "complete") {
      this.handleReset();
    } else {
      !this.state.init
        ? this.setState(
            {
              init: true,
              isStarted: true,
              timerState: "session"
            },
            () => {
              if (this.state.timerState === "session") {
                this.timerLogic(this.state.session, this.state.break);
                this.setState({
                  playState: "running"
                });
              }
            }
          )
        : this.setState(
            {
              isStarted: !this.state.isStarted,
              isPaused: !this.state.isPaused
            },
            () => {
              if (this.state.isPaused) {
                clearInterval(sessionId);
                clearInterval(breakId);
                sessionId = null;
                breakId = null;
                this.setState({
                  timerState: "paused",
                  playState: "paused"
                });
                if (!beep.paused) {
                  beep.pause();
                }
                blinkId = setInterval(this.blinkTimer, 600);
              } else {
                clearInterval(blinkId);
                if (beep.paused) {
                  beep.play();
                }
                blinkId = null;
                this.setState({
                  blink: "inherit",
                  playState: "running"
                });
                if (this.state.totalSecs !== 0) {
                  this.setState(
                    {
                      timerState: this.state.whichTimer
                    },
                    () => {
                      this.state.whichTimer === "session"
                        ? this.setState(
                            {
                              session:
                                this.state.minutes + this.state.seconds / 60
                            },
                            () => {
                              this.timerLogic(
                                this.state.session,
                                this.state.break
                              );
                            }
                          )
                        : this.setState(
                            {
                              break:
                                this.state.minutes + this.state.seconds / 60
                            },
                            () => {
                              this.timerLogic(
                                this.state.session,
                                this.state.break
                              );
                              this.setState({
                                playState: "running"
                              });
                            }
                          );
                    }
                  );
                } else {
                  this.setState({
                    timerState: "complete"
                  });
                }
              }
            }
          );
    }
  }

  handleMute() {
    if (this.state.timerState === "complete") {
      this.handleReset();
    } else {
      this.setState({
        isMuted: !this.state.isMuted
      });
    }
  }

  handleReset() {
    let mute = this.state.isMuted;
    beep.pause();
    beep.currentTime = 0;
    this.setState(this.getInitialState(), () => {
      this.setState({
        minutes: this.state.session,
        seconds: 0,
        isMuted: mute
      });
      target = null;
      sessionTemp = this.state.session;
      breakTemp = this.state.break;
    });
    this.restartAnimation(this.state.session * 60);
    clearInterval(sessionId);
    clearInterval(breakId);
    clearInterval(blinkId);
    sessionId = null;
    breakId = null;
    blinkId = null;
  }

  render() {
    return (
      <div className='container'>
        <div className='header-container'>
          <Session
            increment={
              <Increment
                handleIncrement={this.handleIncrement}
                id='session-inc'
              />
            }
            decrement={
              <Decrement
                handleDecrement={this.handleDecrement}
                id='session-dec'
              />
            }
            session={this.state.session}
          />
          <Break
            increment={
              <Increment
                handleIncrement={this.handleIncrement}
                id='break-inc'
              />
            }
            decrement={
              <Decrement
                handleDecrement={this.handleDecrement}
                id='break-dec'
              />
            }
            break={this.state.break}
          />
        </div>
        <div className='timer-container'>
          <Timer
            session={this.state.session}
            break={this.state.break}
            minutes={this.state.minutes}
            seconds={this.state.seconds}
            init={this.state.init}
            isStarted={this.state.isStarted}
            isPaused={this.state.isPaused}
            timerState={this.state.timerState}
            blink={this.state.blink}
            totalSecs={this.state.totalSecs}
            whichTimer={this.state.whichTimer}
            restartAnimation={this.state.restartAnimation}
            duration={this.state.duration}
            playState={this.state.playState}
            taskSubmit={this.state.taskSubmit}
          />
        </div>
        <div className='footer-container'>
          <Controls
            handleTimerState={this.handleTimerState}
            handleMute={this.handleMute}
            handleReset={this.handleReset}
            init={this.state.init}
            isStarted={this.state.isStarted}
            isPaused={this.state.isPaused}
            timerState={this.state.timerState}
            isMuted={this.state.isMuted}
          />

          <AddTask
            taskInput={this.state.taskInput}
            taskSubmit={this.state.taskSubmit}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
            isMaxLength={this.state.isMaxLength}
          />
        </div>
        <Audio isMuted={this.state.isMuted} />
      </div>
    );
  }
}

ReactDOM.render(<Pomodoro />, document.getElementById("root"));
