## Login user

```bash
curl -X 'POST' \
  'http://localhost:3000/auth/login' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "owner@my-food-store.com",
  "password": "Password123!"
}'
```
