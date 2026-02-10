use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

pub async fn process_data(Json(request): Json<DataRequest>) -> impl IntoResponse {
    // Calculate sums and return response
    let mut string_len: usize = 0;
    let mut int_sum: i32 = 0;

    for item in request.data {
        match item {
            DataType::String(s) => {
                string_len += s.len();
            },
            DataType::Num(n) => {
                int_sum += n;
            }
        }
    }

    let response = DataResponse {
        string_len: string_len,
        int_sum: int_sum
    };

    (StatusCode::OK, Json(response))
}

#[derive(Deserialize)]
pub struct DataRequest {
    data: Vec<DataType>
}

#[derive(Serialize)]
pub struct DataResponse {
    string_len: usize,
    int_sum: i32,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum DataType {
    String(String),
    Num(i32),
}