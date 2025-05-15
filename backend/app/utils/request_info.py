from fastapi import Request


def get_client_ip(request: Request) -> str:
    """
    取得使用者的 IP 位置。

    Args:
        request (Request): FastAPI 的請求物件。

    Returns:
        str: 使用者的 IP 位址。
    """
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    ip = x_forwarded_for.split(
        ',')[0] if x_forwarded_for else request.client.host
    return ip
