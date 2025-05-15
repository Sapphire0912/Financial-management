class AuthorizationError(Exception):
    def __init__(self, request, message="JWT 驗證失敗"):
        self.message = message
        self.client_ip = request.client.host
        self.user_agent = request.headers.get("User-Agent")
        self.token = request.headers.get("Authorization")
        super().__init__(self.message)
