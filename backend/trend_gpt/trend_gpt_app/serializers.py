from rest_framework import serializers

class MongoDocumentSerializer(serializers.Serializer):
    # Use dict to accept any MongoDB document dynamically
    def to_representation(self, instance):
        # Convert ObjectId to string
        if "_id" in instance:
            instance["_id"] = str(instance["_id"])
        return instance
