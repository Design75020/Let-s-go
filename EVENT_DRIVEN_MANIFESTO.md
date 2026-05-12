# EVENT-DRIVEN MANIFESTO

## 1. L'événement comme Source de Vérité
Dans LetsGoFood, l'état actuel est une conséquence d'une suite d'événements.

## 2. Structure d'un Événement
```json
{
  "type": "order.created",
  "actorId": "user_123",
  "resourceId": "order_456",
  "correlationId": "uuid-v4",
  "timestamp": "2024-05-22T..."
}
```

## 3. Avantages
- **Idempotence** : Facilité de rejeu en cas d'erreur.
- **Découplage** : JULES peut être mis à jour sans impacter l'App Client.
- **Observabilité** : On ne demande plus "que s'est-il passé ?", on lit le log.
