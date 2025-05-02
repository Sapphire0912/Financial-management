from fastapi import Request


def get_client_ip(request: Request) -> str:
    """
      get_client_ip(request: Request) -> str: 取得使用者 ip 位置
    """
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    ip = x_forwarded_for.split(
        ',')[0] if x_forwarded_for else request.client.host
    return ip
