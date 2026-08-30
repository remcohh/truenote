// AudioWorkletProcessor: runs on the dedicated audio rendering thread, not the
// main thread. It just accumulates raw mic samples into fixed-size blocks and
// hands each finished block to the main thread — no pitch math here, so the
// audio thread stays cheap and never blocks on anything the main thread is doing.
class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      for (let i = 0; i < channel.length; i++) {
        this.buffer[this.writeIndex++] = channel[i];
        if (this.writeIndex === this.bufferSize) {
          this.port.postMessage(this.buffer, [this.buffer.buffer]);
          this.buffer = new Float32Array(this.bufferSize);
          this.writeIndex = 0;
        }
      }
    }
    // Keep the processor alive for the lifetime of the node.
    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
