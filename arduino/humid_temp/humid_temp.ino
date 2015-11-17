const int dataPin =  8;
      int temp    = -1;
      int hum     = -1;

void setup() {
  Serial.begin(115200);
}

int readDHT11() {
  uint8_t recvBuffer[5];
  uint8_t cnt = 7;
  uint8_t idx = 0;
  for(int i; i< 5; i++) recvBuffer[i] = 0;

  pinMode(dataPin, OUTPUT);
  digitalWrite(dataPin, LOW);
  delay(18);
  digitalWrite(dataPin, HIGH);

  delayMicroseconds(40);
  pinMode(dataPin, INPUT);
  pulseIn(dataPin, HIGH);

  unsigned int timeout = 10000;
  for (int i=0; i<40; i++){
    timeout = 10000;
    while(digitalRead(dataPin) == LOW) {
      if(timeout == 0) return -1;
      timeout--;
    }

    unsigned long t = micros();

    timeout = 10000;
    while(digitalRead(dataPin) == HIGH) {
      if (timeout == 0 ) return -1;
      timeout--;
    }

    if((micros() - t) > 40) recvBuffer[idx] |= (1 << cnt);
    if(cnt == 0) {
      cnt = 7;
      idx++;
    }
    else cnt--;
  }

  hum = recvBuffer[0];
  temp = recvBuffer[2];
  uint8_t sum = recvBuffer[0] + recvBuffer[2];
  if(recvBuffer[4] != sum) return -2;
  return 0;
}

void loop() {
  int ret = readDHT11();
  /*if(ret != 0) Serial.println(ret);*/

  String json = "{";
  json += "\"humidity\":";
  json += hum;
  json += ",";
  json += "\"temperature\":";
  json += temp;
  json += "}";
  Serial.print(json);
  Serial.flush();
  delay(500);
}
