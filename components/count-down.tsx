import React, { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

export interface CountDownProps {
  time: number;
  isPlaying: boolean;
}

const minuteSeconds = 60;
const hourSeconds = minuteSeconds * 60;
const daySeconds = hourSeconds * 24;

const timerProps = {
  size: 160,
  strokeWidth: 10,
};

const getTimeSeconds = (time: number) =>
  Math.max(Math.ceil(minuteSeconds - time) - 1, 0);
const getTimeMinutes = (time: number) =>
  Math.max(Math.ceil(time / minuteSeconds) - 1, 0);
const getTimeHours = (time: number) =>
  Math.max(Math.ceil(time / hourSeconds) - 1, 0);

export const CountDown: React.FC<CountDownProps> = ({
  time,
  isPlaying,
}) => {
  const startTime = Date.now() / 1000; // use UNIX timestamp in seconds
  const endTime = startTime + time; // use UNIX timestamp in seconds
  const remainingTime = endTime - startTime;

  return (
    <div className="flex items-center gap-6 mb-8">
      <CountdownCircleTimer
        {...timerProps}
        isPlaying={isPlaying}
        colors={["#60A5FA", "#ff0000"]}
        colorsTime={[10, 0]}
        duration={daySeconds}
        initialRemainingTime={remainingTime % daySeconds}
      >
        {({ elapsedTime }) => (
          <div className="text-center">
            <p className="font-bold text-3xl">
              {getTimeHours(daySeconds - elapsedTime)}
            </p>
            <p>Hours</p>
          </div>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        isPlaying={isPlaying}
        colors={["#60A5FA", "#ff0000"]}
        colorsTime={[10, 0]}
        duration={hourSeconds}
        initialRemainingTime={remainingTime % hourSeconds}
        onComplete={(totalElapsedTime) => {
          return {
            shouldRepeat: remainingTime - totalElapsedTime > minuteSeconds,
            newInitialRemainingTime: 60,
          };
        }}
      >
        {({ elapsedTime }) => (
          <div className="text-center">
            <p className="font-bold text-3xl">
              {getTimeMinutes(hourSeconds - elapsedTime)}
            </p>
            <p>Minutes</p>
          </div>
        )}
      </CountdownCircleTimer>
      <CountdownCircleTimer
        {...timerProps}
        isPlaying={isPlaying}
        colors={["#60A5FA", "#ff0000"]}
        colorsTime={[10, 0]}
        duration={minuteSeconds}
        initialRemainingTime={remainingTime % minuteSeconds}
        onComplete={(totalElapsedTime) => {
          return {
            shouldRepeat: remainingTime > totalElapsedTime,
            newInitialRemainingTime: 60,
          };
        }}
      >
        {({ elapsedTime }) => (
          <div className="text-center">
            <p className="font-bold text-3xl">{getTimeSeconds(elapsedTime)}</p>
            <p>Seconds</p>
          </div>
        )}
      </CountdownCircleTimer>
    </div>
  );
};
