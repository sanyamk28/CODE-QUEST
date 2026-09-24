# Known Issues & Technical Debt (KNOWN_ISSUES.md)

## 1. Open Items & Future Enhancements

1. **Google Generative AI Deprecation Notice**:
   - *Status*: `google.generativeai` is deprecated in favor of the new unified `google.genai` SDK.
   - *Plan*: Migrate `app/api/v1/ai_features.py` imports to `google.genai` in next iteration.

2. **Celery Redis Connection on Standalone Windows**:
   - *Status*: Running Celery directly on native Windows requires specifying `--pool=solo` due to lack of fork support on Windows NT.
   - *Mitigation*: In Docker and production Linux environments, Celery standard prefork worker runs seamlessly as configured in `docker-compose.yml`.

3. **Memory Limits in Sandbox Microservice**:
   - *Status*: Docker deployment limits sandbox executor container to 512MB RAM and 1.0 CPU. For larger data science problem execution, container limits should be dynamically configurable per problem difficulty.
