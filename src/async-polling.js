const EventEmitter = require('events');

/**
 * This event emitter can fire the following events:
 * run, start, result, error, end, schedule, stop
 *
 * @param {Function} pollingFunc Called for each poll with a callback as
 *                               parameter. Call it at the end of each poll
 *                               to provide an error (if any),
 *                               a result (if any) and whether to stop
 *                               the polling or not.
 * @param {number|object} delay Minimum number of milliseconds to wait
 *                              before scheduling a new poll.
 */
class AsyncPolling extends EventEmitter {
  constructor(pollingFunc, delay) {
    super();
    this._pollingFunc = pollingFunc.bind(this, this._pollCallback.bind(this));
    this._delay = delay.valueOf();

    this._timer = null;
    this._mustSchedule = false;
  }

  /**
   * Start polling.
   */
  run() {
    this.emit('run');
    this._mustSchedule = true;
    this._poll();
  };

  /**
   * Cancel any scheduled poll and prevent future scheduling.
   */
  stop() {
    this._mustSchedule = false;
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this.emit('stop');
  };

  _poll() {
    this.emit('start');
    this._pollingFunc();
  }

  _pollCallback(error, result) {
    if (error) {
      this.emit('error', error);
    } else {
      this.emit('result', result);
    }
    this.emit('end', error, result);

    if (this._mustSchedule) {
      this._timer = setTimeout(this._poll.bind(this), this._delay);
      this.emit('schedule', this._delay);
    }
  }
}

module.exports = AsyncPolling
