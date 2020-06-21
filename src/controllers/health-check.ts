export const ping = async (ctx: any) => {
  ctx.body = { msg: "pong", status: "success" }
}
