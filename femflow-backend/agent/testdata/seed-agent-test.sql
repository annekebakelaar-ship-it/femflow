-- Fictieve testgegevens voor de Neon-branch agent-test, database ovari_agent_test.
--
-- NOG NIET UITGEVOERD. Dit bestand is het plan; uitvoeren gebeurt pas na een
-- expliciet akkoord, en uitsluitend op ovari_agent_test.
--
-- Alles hieronder is verzonnen:
--   * e-mailadressen op .invalid (RFC 2606), dus er kan nooit echte post heen;
--   * vaste UUID's die nergens anders bestaan;
--   * een wearable-token dat letterlijk zegt dat het geen token is.
-- Er staat geen enkel gegeven van een echte gebruiker in.

BEGIN;

-- 1. Twee fictieve gebruikers ------------------------------------------------
-- Testgebruiker Een is de hoofdpersoon: zij logt in, geeft toestemming en
-- koppelt ChatGPT. Testgebruiker Twee bestaat alleen om te bewijzen dat haar
-- gegevens NOOIT in het antwoord van Een terechtkomen.
INSERT INTO femflow_users (id, email, name, birth_date) VALUES
  ('11111111-1111-4111-8111-111111111111', 'ovari-test-1@voorbeeld.invalid', 'Testgebruiker Een', '1979-06-01'),
  ('22222222-2222-4222-8222-222222222222', 'ovari-test-2@voorbeeld.invalid', 'Testgebruiker Twee', '1985-03-15')
ON CONFLICT (id) DO NOTHING;

-- 2. Cyclusgegevens ----------------------------------------------------------
-- Een: veertien dagen geleden gestart, cyclus 28. get_my_cycle_overview hoort
-- dus cyclusdag 15 te melden. Twee: andere waarden, zodat verwisseling opvalt.
INSERT INTO femflow_menstruation_data (id, user_id, start_date, cycle_length, bleeding_days) VALUES
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', CURRENT_DATE - 14, 28, 5),
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222', CURRENT_DATE - 40, 31, 6)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Wearable-koppeling voor Een --------------------------------------------
-- access_token is NOT NULL in het schema, dus er moet iets staan. Dit is
-- NADRUKKELIJK geen werkend token: een pull naar Oura hoort hiermee te falen,
-- en dat is precies de bedoeling. De metingen hieronder zetten we zelf neer.
INSERT INTO femflow_wearable_connections (id, user_id, email, wearable_type, access_token, refresh_token, token_expires_at, last_sync_at) VALUES
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', 'ovari-test-1@voorbeeld.invalid', 'oura',
   'NEP-TOKEN-geen-echte-koppeling', NULL, NULL, NOW())
ON CONFLICT (user_id, wearable_type) DO NOTHING;

-- 4. Eenentwintig verzonnen nachten voor Een ---------------------------------
-- De laatste zeven nachten hebben een hogere HRV en een lagere rusthartslag
-- dan de veertien daarvoor, zodat get_my_recovery_trend een richting laat zien
-- in plaats van "te weinig metingen".
INSERT INTO femflow_biometric_readings
  (id, user_id, reading_date, sleep_duration_min, deep_sleep_min, hrv_ms, resting_heart_rate, recovery_index)
SELECT gen_random_uuid(),
       '11111111-1111-4111-8111-111111111111',
       CURRENT_DATE - d,
       400 + (d % 5) * 10,
       55 + (d % 4) * 6,
       CASE WHEN d <= 6 THEN 50 + (d % 3) ELSE 42 + (d % 3) END,
       CASE WHEN d <= 6 THEN 57 ELSE 61 END,
       65 + (d % 5) * 4
FROM generate_series(0, 20) AS d
ON CONFLICT (user_id, reading_date) DO NOTHING;

-- 5. Quizuitkomst voor Een ---------------------------------------------------
INSERT INTO femflow_quiz_results (id, user_id, email, constellation) VALUES
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', 'ovari-test-1@voorbeeld.invalid',
   '{"fase":"vroege perimenopauze","klachten":["slecht slapen","opvliegers"],"bron":"fictieve testdata"}'::jsonb)
ON CONFLICT DO NOTHING;

COMMIT;

-- NIET geseed: femflow_agent_consent. De toestemming hoort via het scherm in
-- de app gegeven te worden, want dat is juist wat getest moet worden.
--
-- Wil je de toestemming toch alvast zetten om een tool los te proberen:
-- INSERT INTO femflow_agent_consent (user_id, granted_at, versie)
-- VALUES ('11111111-1111-4111-8111-111111111111', NOW(), '1.0')
-- ON CONFLICT (user_id) DO UPDATE SET granted_at = NOW(), revoked_at = NULL;
