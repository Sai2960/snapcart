import axios from "axios";

async function emitEventHandler(event: string, data: any, socketId?: string | null, room?: string) {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_SOCKET_SERVER}/notify`,
      { socketId, event, data, room },
    );
  } catch (error) {
    console.log(error);
  }
}

export default emitEventHandler;